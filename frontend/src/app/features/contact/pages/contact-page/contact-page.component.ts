import { Component, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="bg-[#FAFBFC] min-h-screen py-16 px-6">
      <div class="max-w-6xl mx-auto">
        <!-- Page Heading -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-slate-800">Contact Us</h1>
          <p class="mt-3 text-lg text-slate-500">
            Have questions about our training programs? We'd love to hear from you.
          </p>
        </div>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <!-- Left: Contact Form -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            @if (submitted()) {
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 mb-2">Message Sent!</h2>
                <p class="text-slate-500 mb-6">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  (click)="resetForm()"
                  class="text-[#0D7377] font-semibold hover:underline">
                  Send another message
                </button>
              </div>
            } @else {
              <h2 class="text-2xl font-bold text-slate-800 mb-6">Send Us a Message</h2>
              <form (submit)="onSubmit($event)" class="space-y-5">
                <!-- Name -->
                <div>
                  <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <input
                    id="name"
                    type="text"
                    [value]="name()"
                    (input)="name.set(asInput($event).value)"
                    (blur)="nameTouched.set(true)"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/40 focus:border-[#0D7377] transition"
                    placeholder="Your full name" />
                  @if (nameTouched() && !name().trim()) {
                    <p class="mt-1 text-sm text-[#F87171]">Name is required.</p>
                  }
                </div>

                <!-- Email -->
                <div>
                  <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    id="email"
                    type="email"
                    [value]="email()"
                    (input)="email.set(asInput($event).value)"
                    (blur)="emailTouched.set(true)"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/40 focus:border-[#0D7377] transition"
                    placeholder="you@example.com" />
                  @if (emailTouched() && !emailValid()) {
                    <p class="mt-1 text-sm text-[#F87171]">Please enter a valid email address.</p>
                  }
                </div>

                <!-- Phone (optional) -->
                <div>
                  <label for="phone" class="block text-sm font-medium text-slate-700 mb-1">Phone <span class="text-slate-400">(optional)</span></label>
                  <input
                    id="phone"
                    type="tel"
                    [value]="phone()"
                    (input)="phone.set(asInput($event).value)"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/40 focus:border-[#0D7377] transition"
                    placeholder="(555) 123-4567" />
                </div>

                <!-- Service of Interest -->
                <div>
                  <label for="service" class="block text-sm font-medium text-slate-700 mb-1">Service of Interest *</label>
                  <select
                    id="service"
                    [value]="service()"
                    (change)="service.set(asSelect($event).value)"
                    (blur)="serviceTouched.set(true)"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/40 focus:border-[#0D7377] transition bg-white">
                    <option value="">Select a service</option>
                    <option value="Private Training">Private Training</option>
                    <option value="Group Classes">Group Classes</option>
                    <option value="Board & Train">Board & Train</option>
                    <option value="Other">Other</option>
                  </select>
                  @if (serviceTouched() && !service()) {
                    <p class="mt-1 text-sm text-[#F87171]">Please select a service.</p>
                  }
                </div>

                <!-- Dog's Name (optional) -->
                <div>
                  <label for="dogName" class="block text-sm font-medium text-slate-700 mb-1">Dog's Name <span class="text-slate-400">(optional)</span></label>
                  <input
                    id="dogName"
                    type="text"
                    [value]="dogName()"
                    (input)="dogName.set(asInput($event).value)"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/40 focus:border-[#0D7377] transition"
                    placeholder="Your dog's name" />
                </div>

                <!-- Message -->
                <div>
                  <label for="message" class="block text-sm font-medium text-slate-700 mb-1">Message *</label>
                  <textarea
                    id="message"
                    rows="4"
                    [value]="message()"
                    (input)="message.set(asTextarea($event).value)"
                    (blur)="messageTouched.set(true)"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/40 focus:border-[#0D7377] transition resize-y"
                    placeholder="Tell us how we can help..."></textarea>
                  @if (messageTouched() && !message().trim()) {
                    <p class="mt-1 text-sm text-[#F87171]">Message is required.</p>
                  }
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  [disabled]="!formValid()"
                  [ngClass]="{
                    'bg-[#F59E0B] hover:bg-amber-600 cursor-pointer': formValid(),
                    'bg-slate-300 cursor-not-allowed': !formValid()
                  }"
                  class="w-full py-3 rounded-lg text-white font-semibold transition shadow-sm">
                  Send Message
                </button>
              </form>
            }
          </div>

          <!-- Right: Contact Info Cards -->
          <div class="space-y-5">
            <!-- Address -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start gap-4">
              <div class="w-11 h-11 rounded-lg bg-[#0D7377]/10 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-[#0D7377]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-slate-800">Address</h3>
                <p class="text-slate-500 mt-1">123 Training Way<br />Charlotte, NC 28202</p>
              </div>
            </div>

            <!-- Phone -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start gap-4">
              <div class="w-11 h-11 rounded-lg bg-[#0D7377]/10 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-[#0D7377]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-slate-800">Phone</h3>
                <p class="text-slate-500 mt-1">(704) 555-PAWS</p>
              </div>
            </div>

            <!-- Email -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start gap-4">
              <div class="w-11 h-11 rounded-lg bg-[#0D7377]/10 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-[#0D7377]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-slate-800">Email</h3>
                <p class="text-slate-500 mt-1">info&#64;pawforward.com</p>
              </div>
            </div>

            <!-- Hours -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start gap-4">
              <div class="w-11 h-11 rounded-lg bg-[#0D7377]/10 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-[#0D7377]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-slate-800">Hours of Operation</h3>
                <div class="text-slate-500 mt-1 space-y-0.5">
                  <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
                  <p>Saturday: 9:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="mt-16">
          <h2 class="text-2xl font-bold text-slate-800 text-center mb-8">Frequently Asked Questions</h2>
          <div class="max-w-3xl mx-auto space-y-3">
            @for (faq of faqs; track faq.question; let i = $index) {
              <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  (click)="toggleFaq(i)"
                  class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition">
                  <span class="font-semibold text-slate-800">{{ faq.question }}</span>
                  <svg
                    class="w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4"
                    [ngClass]="{ 'rotate-180': openFaq() === i }"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                @if (openFaq() === i) {
                  <div class="px-6 pb-4 text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    {{ faq.answer }}
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ContactPageComponent {
  // Form fields
  name = signal('');
  email = signal('');
  phone = signal('');
  service = signal('');
  dogName = signal('');
  message = signal('');

  // Touched state
  nameTouched = signal(false);
  emailTouched = signal(false);
  serviceTouched = signal(false);
  messageTouched = signal(false);

  // Form state
  submitted = signal(false);

  // FAQ state
  openFaq = signal<number | null>(null);

  emailValid = computed(() => {
    const val = this.email();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  });

  formValid = computed(() => {
    return (
      this.name().trim() !== '' &&
      this.emailValid() &&
      this.service() !== '' &&
      this.message().trim() !== ''
    );
  });

  faqs = [
    {
      question: 'What age should my dog be to start training?',
      answer:
        'Puppies can start basic training as early as 8 weeks old. We offer puppy socialization classes for dogs 8-16 weeks, and our group obedience classes are suitable for dogs 4 months and older. It is never too late to start training - we work with dogs of all ages!',
    },
    {
      question: 'How long does it take to see results from training?',
      answer:
        'Most owners notice improvements within the first 1-2 sessions. However, lasting behavior change typically takes 4-8 weeks of consistent practice. Our trainers will provide you with homework exercises to reinforce lessons between sessions.',
    },
    {
      question: 'What training methods do you use?',
      answer:
        'We use positive reinforcement-based training methods backed by the latest behavioral science. This means we reward desired behaviors rather than punishing unwanted ones. Our approach is force-free and builds trust between you and your dog.',
    },
    {
      question: 'Do I need to attend the training sessions with my dog?',
      answer:
        'For private training and group classes, yes - owner participation is essential so you learn the techniques to use at home. Our Board & Train program is the exception, where your dog stays with us for intensive training, followed by transfer sessions with you.',
    },
    {
      question: 'What is your cancellation policy?',
      answer:
        'We require at least 24 hours notice for cancellations or rescheduling. Cancellations made within 24 hours of the scheduled session will be charged the full session fee. Group class enrollments can be transferred to a future session if space is available.',
    },
  ];

  asInput(event: Event): HTMLInputElement {
    return event.target as HTMLInputElement;
  }

  asSelect(event: Event): HTMLSelectElement {
    return event.target as HTMLSelectElement;
  }

  asTextarea(event: Event): HTMLTextAreaElement {
    return event.target as HTMLTextAreaElement;
  }

  toggleFaq(index: number): void {
    this.openFaq.set(this.openFaq() === index ? null : index);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.nameTouched.set(true);
    this.emailTouched.set(true);
    this.serviceTouched.set(true);
    this.messageTouched.set(true);

    if (this.formValid()) {
      this.submitted.set(true);
    }
  }

  resetForm(): void {
    this.name.set('');
    this.email.set('');
    this.phone.set('');
    this.service.set('');
    this.dogName.set('');
    this.message.set('');
    this.nameTouched.set(false);
    this.emailTouched.set(false);
    this.serviceTouched.set(false);
    this.messageTouched.set(false);
    this.submitted.set(false);
  }
}
