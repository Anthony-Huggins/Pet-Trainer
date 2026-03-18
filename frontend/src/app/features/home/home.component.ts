import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrainerService } from '../../core/services/trainer.service';
import { TrainerProfile } from '../../core/models';

interface Testimonial {
  stars: number;
  quote: string;
  clientName: string;
  dogName: string;
  dogBreed: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-[#FAFBFC]">

      <!-- ==================== HERO SECTION ==================== -->
      <section
        class="relative bg-gradient-to-br from-[#0D7377] to-teal-900 text-white py-24 md:py-32 px-6"
      >
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Professional Dog Training That Gets Results
          </h1>
          <p class="text-lg md:text-xl text-teal-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            From puppy basics to advanced agility &mdash; PawForward Academy
            builds confident, well-behaved dogs through positive reinforcement
            training.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              routerLink="/book"
              class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-lg transition shadow-lg hover:shadow-xl"
            >
              Book a Session
            </a>
            <a
              routerLink="/services"
              class="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-lg transition"
            >
              View Our Services
            </a>
          </div>
        </div>
      </section>

      <!-- ==================== STATS SECTION ==================== -->
      <section class="relative z-10 px-6">
        <div class="max-w-4xl mx-auto -mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div
            class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
          >
            <div class="text-3xl mb-2">&#11088;</div>
            <div class="text-3xl font-bold text-slate-800">500+</div>
            <div class="text-slate-500 font-medium">Dogs Trained</div>
          </div>
          <div
            class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
          >
            <div class="text-3xl mb-2">&#127942;</div>
            <div class="text-3xl font-bold text-slate-800">15+</div>
            <div class="text-slate-500 font-medium">Years Experience</div>
          </div>
          <div
            class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
          >
            <div class="text-3xl mb-2">&#11088;</div>
            <div class="text-3xl font-bold text-slate-800">4.9</div>
            <div class="text-slate-500 font-medium">Star Rating</div>
          </div>
        </div>
      </section>

      <!-- ==================== SERVICES OVERVIEW SECTION ==================== -->
      <section class="py-20 px-6">
        <div class="max-w-6xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Our Training Programs
          </h2>
          <p class="text-slate-500 mb-12 max-w-2xl mx-auto">
            Tailored programs designed to bring out the best in every dog, no
            matter their age or skill level.
          </p>
          <div class="grid md:grid-cols-3 gap-8">
            <!-- Private Training -->
            <div
              class="bg-white rounded-xl shadow-sm border-t-4 border-[#0D7377] p-8 hover:shadow-md transition text-left"
            >
              <div
                class="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4"
              >
                <svg
                  class="w-6 h-6 text-[#0D7377]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-slate-800 mb-3">
                Private Training
              </h3>
              <p class="text-slate-600 mb-4 leading-relaxed">
                One-on-one sessions tailored to your dog's specific needs and
                behavioral goals. Personalized attention for maximum results.
              </p>
              <p class="text-[#0D7377] font-semibold mb-4">From $85/session</p>
              <a
                routerLink="/services"
                class="text-amber-500 hover:text-amber-600 font-medium inline-flex items-center gap-1 transition"
              >
                Learn More
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>

            <!-- Group Classes -->
            <div
              class="bg-white rounded-xl shadow-sm border-t-4 border-[#0D7377] p-8 hover:shadow-md transition text-left"
            >
              <div
                class="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4"
              >
                <svg
                  class="w-6 h-6 text-[#0D7377]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-slate-800 mb-3">
                Group Classes
              </h3>
              <p class="text-slate-600 mb-4 leading-relaxed">
                Socialization and learning in a fun group environment. Great for
                building confidence and social skills with other dogs.
              </p>
              <p class="text-[#0D7377] font-semibold mb-4">From $45/class</p>
              <a
                routerLink="/services"
                class="text-amber-500 hover:text-amber-600 font-medium inline-flex items-center gap-1 transition"
              >
                Learn More
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>

            <!-- Board & Train -->
            <div
              class="bg-white rounded-xl shadow-sm border-t-4 border-[#0D7377] p-8 hover:shadow-md transition text-left"
            >
              <div
                class="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4"
              >
                <svg
                  class="w-6 h-6 text-[#0D7377]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-slate-800 mb-3">
                Board &amp; Train
              </h3>
              <p class="text-slate-600 mb-4 leading-relaxed">
                Intensive programs where your dog stays and learns with us.
                Accelerated results in a structured, caring environment.
              </p>
              <p class="text-[#0D7377] font-semibold mb-4">From $250/week</p>
              <a
                routerLink="/services"
                class="text-amber-500 hover:text-amber-600 font-medium inline-flex items-center gap-1 transition"
              >
                Learn More
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================== MEET OUR TRAINERS SECTION ==================== -->
      <section class="py-20 px-6 bg-slate-50">
        <div class="max-w-6xl mx-auto">
          <h2
            class="text-3xl md:text-4xl font-bold text-slate-800 mb-4 text-center"
          >
            Meet Your Trainers
          </h2>
          <p class="text-slate-500 mb-12 max-w-2xl mx-auto text-center">
            Our certified trainers bring years of experience and a passion for
            helping dogs and their owners succeed.
          </p>

          @if (loadingTrainers()) {
            <div class="flex justify-center py-12">
              <div
                class="w-10 h-10 border-4 border-teal-200 border-t-[#0D7377] rounded-full animate-spin"
              ></div>
            </div>
          } @else if (trainers().length === 0) {
            <p class="text-center text-slate-400 py-12">
              No trainers available at this time.
            </p>
          } @else {
            <div
              class="flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide"
            >
              @for (trainer of trainers(); track trainer.id) {
                <div
                  class="min-w-[280px] md:min-w-0 bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition flex flex-col items-center text-center"
                >
                  <div
                    class="w-20 h-20 rounded-full bg-gradient-to-br from-[#0D7377] to-teal-600 flex items-center justify-center text-white text-2xl font-bold mb-4"
                  >
                    {{ getInitials(trainer.name) }}
                  </div>
                  <h3 class="text-lg font-semibold text-slate-800 mb-1">
                    {{ trainer.name }}
                  </h3>
                  @if (trainer.yearsExperience) {
                    <p class="text-sm text-slate-400 mb-3">
                      {{ trainer.yearsExperience }} years experience
                    </p>
                  }
                  <div class="flex flex-wrap gap-2 justify-center mb-4">
                    @for (spec of trainer.specializations; track spec) {
                      <span
                        class="text-xs font-medium bg-teal-50 text-[#0D7377] px-3 py-1 rounded-full"
                      >
                        {{ spec }}
                      </span>
                    }
                  </div>
                  <a
                    routerLink="/trainers"
                    class="mt-auto text-amber-500 hover:text-amber-600 font-medium text-sm transition"
                  >
                    View Profile
                  </a>
                </div>
              }
            </div>
          }
        </div>
      </section>

      <!-- ==================== TESTIMONIALS SECTION ==================== -->
      <section class="py-20 px-6">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            What Our Clients Say
          </h2>
          <p class="text-slate-500 mb-12">
            Hear from the families who have transformed their dogs' behavior
            with PawForward Academy.
          </p>

          <!-- Carousel -->
          <div class="relative">
            @for (
              testimonial of testimonials;
              track testimonial.clientName;
              let i = $index
            ) {
              @if (i === activeTestimonial()) {
                <div class="bg-white rounded-2xl shadow-md p-8 md:p-10">
                  <!-- Stars -->
                  <div class="flex justify-center gap-1 mb-4">
                    @for (star of getStars(testimonial.stars); track $index) {
                      <svg
                        class="w-5 h-5 text-amber-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        />
                      </svg>
                    }
                  </div>
                  <p
                    class="text-slate-600 italic text-lg leading-relaxed mb-6"
                  >
                    "{{ testimonial.quote }}"
                  </p>
                  <div>
                    <p class="font-semibold text-slate-800">
                      {{ testimonial.clientName }}
                    </p>
                    <p class="text-sm text-slate-400">
                      {{ testimonial.dogName }} &mdash;
                      {{ testimonial.dogBreed }}
                    </p>
                  </div>
                </div>
              }
            }

            <!-- Navigation Arrows -->
            <button
              (click)="prevTestimonial()"
              class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-slate-400 hover:text-[#0D7377] transition"
              aria-label="Previous testimonial"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              (click)="nextTestimonial()"
              class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-slate-400 hover:text-[#0D7377] transition"
              aria-label="Next testimonial"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <!-- Dot Indicators -->
          <div class="flex justify-center gap-2 mt-6">
            @for (
              testimonial of testimonials;
              track testimonial.clientName;
              let i = $index
            ) {
              <button
                (click)="goToTestimonial(i)"
                class="w-2.5 h-2.5 rounded-full transition"
                [class]="
                  i === activeTestimonial()
                    ? 'bg-[#0D7377] scale-125'
                    : 'bg-slate-300 hover:bg-slate-400'
                "
                [attr.aria-label]="'Go to testimonial ' + (i + 1)"
              ></button>
            }
          </div>
        </div>
      </section>

      <!-- ==================== CTA SECTION ==================== -->
      <section
        class="bg-gradient-to-br from-[#0D7377] to-teal-900 text-white py-20 px-6"
      >
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Dog's Training Journey?
          </h2>
          <p class="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
            Whether you have a new puppy or an older dog with behavioral
            challenges, we have the perfect program for you.
          </p>
          <a
            routerLink="/book"
            class="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-10 py-4 rounded-lg transition shadow-lg hover:shadow-xl text-lg"
          >
            Schedule a Consultation
          </a>
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  private trainerService = inject(TrainerService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  trainers = signal<TrainerProfile[]>([]);
  loadingTrainers = signal(true);
  activeTestimonial = signal(0);

  testimonials: Testimonial[] = [
    {
      stars: 5,
      quote:
        'Our reactive German Shepherd went from lunging at other dogs to calmly walking past them. The transformation was incredible and happened faster than we ever expected.',
      clientName: 'Sarah Mitchell',
      dogName: 'Bear',
      dogBreed: 'German Shepherd',
    },
    {
      stars: 5,
      quote:
        'The puppy program was exactly what we needed. Our Golden learned basic commands in just a few weeks, and the trainer gave us tools to keep reinforcing at home.',
      clientName: 'James Rodriguez',
      dogName: 'Luna',
      dogBreed: 'Golden Retriever',
    },
    {
      stars: 5,
      quote:
        'Board and train was the best decision we made. We dropped off a chaotic puppy and picked up a well-mannered companion. Worth every penny.',
      clientName: 'Emily Chen',
      dogName: 'Milo',
      dogBreed: 'Australian Shepherd',
    },
    {
      stars: 4,
      quote:
        'Group classes were so much fun! Our rescue pup gained confidence around other dogs, and we met wonderful fellow dog owners. Highly recommend for socialization.',
      clientName: 'David Thompson',
      dogName: 'Daisy',
      dogBreed: 'Mixed Breed',
    },
  ];

  ngOnInit(): void {
    this.trainerService.getTrainers().subscribe({
      next: (trainers) => {
        this.trainers.set(trainers);
        this.loadingTrainers.set(false);
      },
      error: () => {
        this.loadingTrainers.set(false);
      },
    });

    this.intervalId = setInterval(() => {
      this.nextTestimonial();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getStars(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  nextTestimonial(): void {
    this.activeTestimonial.set(
      (this.activeTestimonial() + 1) % this.testimonials.length
    );
  }

  prevTestimonial(): void {
    this.activeTestimonial.set(
      (this.activeTestimonial() - 1 + this.testimonials.length) %
        this.testimonials.length
    );
  }

  goToTestimonial(index: number): void {
    this.activeTestimonial.set(index);
    this.resetInterval();
  }

  private resetInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      this.nextTestimonial();
    }, 5000);
  }
}
