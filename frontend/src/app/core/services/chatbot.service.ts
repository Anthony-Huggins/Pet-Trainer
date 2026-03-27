import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
  data?: any;
}

export interface ChatResponse {
  message: string;
  toolsUsed?: string[];
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  sendMessage(message: string, history: ChatMessage[]): Observable<ChatResponse> {
    let headers = new HttpHeaders();
    const token = this.authService.getAccessToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post<ChatResponse>(
      `${environment.mcpServerUrl}/chat`,
      { message, conversationHistory: history },
      { headers }
    );
  }
}
