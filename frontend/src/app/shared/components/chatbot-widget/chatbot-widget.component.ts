import {
  Component,
  signal,
  inject,
  ElementRef,
  viewChild,
  afterNextRender,
  AfterRenderPhase,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../../core/services/chatbot.service';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
  data?: any;
}

interface QuickReply {
  label: string;
  message: string;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating toggle button -->
    @if (!isOpen()) {
      <button
        (click)="open()"
        class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#0D7377] hover:bg-[#0a5c5f] text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center"
        [class.animate-pulse]="showPulse()"
        aria-label="Open chat"
      >
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    }

    <!-- Chat panel -->
    @if (isOpen()) {
      <div class="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[500px] max-h-[calc(100vh-3rem)] flex flex-col rounded-2xl shadow-2xl border border-slate-200 bg-white overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 bg-[#0D7377] text-white shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-lg">&#128062;</span>
            <span class="font-semibold text-sm">PawForward Assistant</span>
          </div>
          <button
            (click)="close()"
            class="p-1 rounded-lg hover:bg-white/20 transition"
            aria-label="Close chat"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Messages area -->
        <div #messagesContainer class="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
          @for (msg of messages(); track $index) {
            <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
              <div
                [class]="msg.role === 'user'
                  ? 'max-w-[80%] px-4 py-2 rounded-l-xl rounded-tr-xl bg-[#0D7377] text-white text-sm'
                  : 'max-w-[85%] px-4 py-2 rounded-r-xl rounded-tl-xl bg-white border border-slate-200 text-slate-700 text-sm shadow-sm'"
              >
                <!-- Text content with line breaks -->
                <div class="whitespace-pre-wrap">{{ msg.content }}</div>

                <!-- Structured data rendering -->
                @if (msg.data) {
                  <div class="mt-2 space-y-2">
                    <!-- Services -->
                    @if (isServiceData(msg.data)) {
                      @for (svc of msg.data; track $index) {
                        <div class="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <div class="flex items-center justify-between">
                            <span class="font-semibold text-slate-800 text-xs">{{ svc.name }}</span>
                            @if (svc.price) {
                              <span class="text-xs font-medium text-[#0D7377]">{{ svc.price }}</span>
                            }
                          </div>
                          @if (svc.description) {
                            <p class="text-xs text-slate-500 mt-1">{{ svc.description }}</p>
                          }
                          @if (svc.category) {
                            <span class="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full font-medium">{{ svc.category }}</span>
                          }
                        </div>
                      }
                    }
                    <!-- Trainers -->
                    @if (isTrainerData(msg.data)) {
                      @for (trainer of msg.data; track $index) {
                        <div class="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <span class="font-semibold text-slate-800 text-xs">{{ trainer.name }}</span>
                          @if (trainer.yearsExperience) {
                            <span class="text-xs text-slate-400 ml-1">({{ trainer.yearsExperience }} yrs exp)</span>
                          }
                          @if (trainer.specialties) {
                            <div class="flex flex-wrap gap-1 mt-1">
                              @for (s of trainer.specialties; track $index) {
                                <span class="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] rounded-full font-medium">{{ s }}</span>
                              }
                            </div>
                          }
                        </div>
                      }
                    }
                    <!-- Slots -->
                    @if (isSlotData(msg.data)) {
                      @for (slot of msg.data; track $index) {
                        <div class="p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                          <span class="font-semibold text-slate-800">{{ slot.date }}</span>
                          <span class="text-slate-500 ml-1">{{ slot.time }}</span>
                          @if (slot.trainerName) {
                            <span class="text-teal-600 ml-1">- {{ slot.trainerName }}</span>
                          }
                        </div>
                      }
                    }
                    <!-- Classes -->
                    @if (isClassData(msg.data)) {
                      @for (cls of msg.data; track $index) {
                        <div class="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <span class="font-semibold text-slate-800 text-xs">{{ cls.name }}</span>
                          @if (cls.schedule) {
                            <span class="text-xs text-slate-500 ml-1">{{ cls.schedule }}</span>
                          }
                          @if (cls.spotsAvailable != null) {
                            <span class="text-xs text-amber-600 ml-1">({{ cls.spotsAvailable }} spots left)</span>
                          }
                        </div>
                      }
                    }
                  </div>
                }

                <!-- Tools used -->
                @if (msg.toolsUsed && msg.toolsUsed.length) {
                  <div class="mt-1 text-[10px] italic text-slate-400">
                    Used: {{ msg.toolsUsed.join(', ') }}
                  </div>
                }
              </div>
            </div>

            <!-- Quick replies after welcome message -->
            @if ($index === 0 && msg.role === 'assistant' && showQuickReplies()) {
              <div class="flex flex-wrap gap-2 justify-center py-1">
                @for (qr of quickReplies; track qr.label) {
                  <button
                    (click)="sendQuickReply(qr)"
                    class="px-3 py-1 text-xs font-medium rounded-full border border-[#0D7377] text-[#0D7377] hover:bg-[#0D7377] hover:text-white transition"
                  >
                    {{ qr.label }}
                  </button>
                }
              </div>
            }
          }

          <!-- Typing indicator -->
          @if (isTyping()) {
            <div class="flex justify-start">
              <div class="px-4 py-2 rounded-r-xl rounded-tl-xl bg-white border border-slate-200 shadow-sm">
                <div class="flex items-center gap-1">
                  <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Input area -->
        <div class="shrink-0 px-3 py-3 border-t border-slate-200 bg-white">
          <form (ngSubmit)="send()" class="flex items-center gap-2">
            <input
              #chatInput
              type="text"
              [(ngModel)]="inputText"
              name="chatInput"
              placeholder="Ask about our services..."
              [disabled]="isTyping()"
              class="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              [disabled]="isTyping() || !inputText().trim()"
              class="p-2 rounded-lg bg-[#0D7377] text-white hover:bg-[#0a5c5f] transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    }
  `,
})
export class ChatbotWidgetComponent {
  private chatbotService = inject(ChatbotService);
  private messagesContainer = viewChild<ElementRef>('messagesContainer');

  isOpen = signal(false);
  messages = signal<DisplayMessage[]>([]);
  inputText = signal('');
  isTyping = signal(false);
  showPulse = signal(true);
  showQuickReplies = signal(true);

  quickReplies: QuickReply[] = [
    { label: 'View Services', message: 'What services do you offer?' },
    { label: 'See Trainers', message: 'Tell me about your trainers' },
    { label: 'Check Availability', message: 'What time slots are available?' },
    { label: 'Pricing', message: 'How much does training cost?' },
    { label: 'Contact Us', message: 'How can I contact you?' },
  ];

  private readonly welcomeMessage =
    `Hi! I'm the PawForward Assistant. I can help you with:\n\u2022 Browse our training services\n\u2022 Check available time slots\n\u2022 Learn about our trainers\n\u2022 Answer questions about policies\n\nHow can I help you today?`;

  constructor() {
    // Stop pulse animation after 3 seconds
    afterNextRender(
      () => {
        setTimeout(() => this.showPulse.set(false), 3000);
      },
      { phase: AfterRenderPhase.Write }
    );
  }

  open(): void {
    this.isOpen.set(true);
    if (this.messages().length === 0) {
      this.messages.set([{ role: 'assistant', content: this.welcomeMessage }]);
    }
    this.scrollToBottom();
  }

  close(): void {
    this.isOpen.set(false);
  }

  send(): void {
    const text = this.inputText().trim();
    if (!text || this.isTyping()) return;

    this.addMessage({ role: 'user', content: text });
    this.inputText.set('');
    this.showQuickReplies.set(false);
    this.isTyping.set(true);

    const history: ChatMessage[] = this.messages().map((m) => ({
      role: m.role,
      content: m.content,
    }));

    this.chatbotService.sendMessage(text, history).subscribe({
      next: (res) => {
        this.addMessage({
          role: 'assistant',
          content: res.message,
          toolsUsed: res.toolsUsed,
          data: res.data,
        });
        this.isTyping.set(false);
      },
      error: () => {
        this.addMessage({
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again later.',
        });
        this.isTyping.set(false);
      },
    });
  }

  sendQuickReply(qr: QuickReply): void {
    this.inputText.set(qr.message);
    this.send();
  }

  // --- Data type guards for template ---
  isServiceData(data: any): boolean {
    return Array.isArray(data) && data.length > 0 && 'name' in data[0] && ('price' in data[0] || 'category' in data[0]);
  }

  isTrainerData(data: any): boolean {
    return Array.isArray(data) && data.length > 0 && 'name' in data[0] && 'specialties' in data[0];
  }

  isSlotData(data: any): boolean {
    return Array.isArray(data) && data.length > 0 && 'date' in data[0] && 'time' in data[0];
  }

  isClassData(data: any): boolean {
    return Array.isArray(data) && data.length > 0 && 'name' in data[0] && 'spotsAvailable' in data[0];
  }

  private addMessage(msg: DisplayMessage): void {
    this.messages.update((msgs) => [...msgs, msg]);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messagesContainer()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
}
