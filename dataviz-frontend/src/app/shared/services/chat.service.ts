import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  chatInput: string;
}

export interface ChatResponse {
  response?: string;
  text?: string;
  message?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private n8nWebhookUrl = 'https://n8n.srv983647.hstgr.cloud/webhook/dataviz/chat-message';

  constructor(private http: HttpClient) {}

  /**
   * Send message to n8n webhook
   * @param message User's chat message
   * @returns Observable with webhook response
   */
  sendMessage(message: string): Observable<ChatResponse> {
    const payload: ChatMessage[] = [
      {
        chatInput: message
      }
    ];

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<ChatResponse>(this.n8nWebhookUrl, payload, { headers });
  }
}
