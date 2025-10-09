import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatService, ChatResponse } from '../../services/chat.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation/translation.service';

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-floating-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './floating-chat.component.html',
  styleUrls: ['./floating-chat.component.scss']
})
export class FloatingChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatBody') private chatBody!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;
  
  isOpen = false;
  isMinimized = false;
  messages: Message[] = [];
  userInput = '';
  isLoading = false;
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    public translation: TranslationService
  ) {}

  ngOnInit(): void {
    // Welcome message - delay to ensure translation service is ready
    setTimeout(() => {
      const welcomeMsg = this.translation.translate('chat.welcome_message');
      this.addAiMessage(welcomeMsg || 'Hello! How can I help you today?');
    }, 100);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  /**
   * Toggle chat window open/close
   */
  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isMinimized = false;
      setTimeout(() => {
        this.focusInput();
      }, 100);
    }
  }

  /**
   * Minimize chat window
   */
  minimizeChat(): void {
    this.isMinimized = true;
  }

  /**
   * Restore minimized chat window
   */
  restoreChat(): void {
    this.isMinimized = false;
    this.focusInput();
  }

  /**
   * Close chat window
   */
  closeChat(): void {
    this.isOpen = false;
    this.isMinimized = false;
  }

  /**
   * Send message to n8n webhook
   */
  send(): void {
    if (!this.userInput.trim() || this.isLoading) {
      return;
    }

    const message = this.userInput.trim();
    this.userInput = '';
    
    // Add user message
    this.addUserMessage(message);
    
    // Send to n8n webhook
    this.isLoading = true;
    
    this.chatService.sendMessage(message).subscribe({
      next: (response: ChatResponse) => {
        this.isLoading = false;
        this.handleResponse(response);
      },
      error: (error) => {
        this.isLoading = false;
        
        // Use translated error message
        const errorMessage = this.translation.translate('chat.error_message');
        this.addAiMessage(errorMessage);
      }
    });
  }

  /**
   * Handle Enter key press
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  /**
   * Add user message to chat
   */
  private addUserMessage(text: string): void {
    this.messages.push({
      sender: 'user',
      text: text,
      timestamp: new Date()
    });
    this.shouldScrollToBottom = true;
  }

  /**
   * Add AI message to chat
   */
  private addAiMessage(text: string): void {
    this.messages.push({
      sender: 'ai',
      text: text,
      timestamp: new Date()
    });
    this.shouldScrollToBottom = true;
  }

  /**
   * Handle webhook response
   */
  private handleResponse(response: any): void {
    let messageText = '';
    
    // Handle array response
    if (Array.isArray(response)) {
      if (response.length > 0) {
        const firstItem = response[0];
        messageText = firstItem.text || firstItem.response || firstItem.message || 
                     firstItem.output || firstItem.content || '';
      }
    }
    // Handle object response
    else if (typeof response === 'object' && response !== null) {
      messageText = response.response || response.text || response.message || 
                   response.output || response.content || response.data || '';
      
      // Try nested data
      if (!messageText && response.data) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          messageText = response.data[0].text || response.data[0].response || response.data[0].message || '';
        } else if (typeof response.data === 'string') {
          messageText = response.data;
        }
      }
    }
    // Handle string response
    else if (typeof response === 'string') {
      messageText = response;
    }
    
    // Fallback message
    if (!messageText) {
      messageText = this.translation.translate('chat.no_response');
    }
    
    this.addAiMessage(messageText);
  }

  /**
   * Scroll chat to bottom
   */
  private scrollToBottom(): void {
    try {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  /**
   * Focus input field
   */
  private focusInput(): void {
    if (this.messageInput) {
      this.messageInput.nativeElement.focus();
    }
  }

  /**
   * Clear chat history
   */
  clearChat(): void {
    this.messages = [];
    this.addAiMessage(
      this.translation.translate('chat.welcome_message') || 
      'Hello! How can I help you today?'
    );
  }

  /**
   * Format timestamp for display
   */
  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
