import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ChatResponse } from './chat.service';

/**
 * Mock Chat Service for testing without n8n
 * To use: Replace ChatService with ChatServiceMock in component imports
 */
@Injectable({
  providedIn: 'root'
})
export class ChatServiceMock {
  
  /**
   * Mock responses for common questions
   */
  private mockResponses: { [key: string]: string } = {
    'hello': 'Hello! How can I help you today?',
    'how to create dashboard': 'To create a dashboard, go to Admin panel → Dashboard Builder → Click "Create Dashboard" button.',
    'help': 'I can help you with: Creating dashboards, Managing sections, Adding widgets, Filtering data, and more!',
    'default': 'Thanks for your message! This is a mock response. The actual AI assistant will be available once the n8n workflow is configured.'
  };

  constructor() {}

  /**
   * Send message (mock)
   */
  sendMessage(message: string): Observable<ChatResponse> {
    // Find matching response
    const lowerMessage = message.toLowerCase();
    let responseText = this.mockResponses['default'];
    
    for (const [key, value] of Object.entries(this.mockResponses)) {
      if (lowerMessage.includes(key)) {
        responseText = value;
        break;
      }
    }

    // Simulate network delay
    return of({ text: responseText }).pipe(delay(800));
  }
}
