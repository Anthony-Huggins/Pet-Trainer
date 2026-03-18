import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-[#0D7377] to-[#0a5c5f] text-white py-20 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">About PawForward Academy</h1>
        <p class="text-lg md:text-xl text-teal-100 max-w-2xl mx-auto">
          Building stronger bonds between dogs and their people through
          science-based, compassionate training.
        </p>
      </div>
    </section>

    <!-- Our Story -->
    <section class="max-w-4xl mx-auto py-16 px-6">
      <h2 class="text-3xl font-bold text-slate-800 mb-6">Our Story</h2>
      <div class="space-y-4 text-slate-600 leading-relaxed">
        <p>
          PawForward Academy was founded with a simple belief: every dog deserves
          to be understood. What started as a small weekend obedience class in a
          local park has grown into a full-service training academy serving
          hundreds of dogs and their families each year. Our founder's passion for
          canine behavior science turned into a mission to make professional,
          force-free training accessible to everyone.
        </p>
        <p>
          Today, our team of certified trainers brings together decades of
          combined experience in animal behavior, veterinary science, and
          hands-on training. Whether you have a brand-new puppy or a senior dog
          learning new tricks, we design every program around your dog's unique
          needs, temperament, and goals. We are proud to be a trusted partner in
          your dog's journey toward confidence and good manners.
        </p>
      </div>
    </section>

    <!-- Our Philosophy -->
    <section class="bg-slate-50 py-16 px-6">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-slate-800 mb-4">Our Philosophy</h2>
        <p class="text-slate-600 mb-10 max-w-2xl">
          We rely exclusively on positive reinforcement techniques, rewarding
          desired behaviors rather than punishing mistakes. This approach is not
          only more humane but also produces faster, longer-lasting results.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Science-Based Methods -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
            <div class="w-14 h-14 rounded-full bg-[#0D7377]/10 flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-[#0D7377]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-800 mb-2">Science-Based Methods</h3>
            <p class="text-sm text-slate-600">
              Every technique we use is grounded in peer-reviewed animal behavior
              research and learning theory.
            </p>
          </div>

          <!-- Positive Reinforcement -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
            <div class="w-14 h-14 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-800 mb-2">Positive Reinforcement</h3>
            <p class="text-sm text-slate-600">
              We reward good behavior with treats, praise, and play, building
              trust and enthusiasm in every session.
            </p>
          </div>

          <!-- Individual Attention -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
            <div class="w-14 h-14 rounded-full bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-800 mb-2">Individual Attention</h3>
            <p class="text-sm text-slate-600">
              No two dogs are alike. We customize every plan to match your
              dog's breed, age, and temperament.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Team -->
    <section class="max-w-4xl mx-auto py-16 px-6">
      <h2 class="text-3xl font-bold text-slate-800 mb-4">Our Team</h2>
      <p class="text-slate-600 mb-6">
        Our certified trainers are passionate about dogs and dedicated to
        helping every family succeed. Each trainer brings a unique set of
        skills and specialties to the academy.
      </p>
      <a routerLink="/trainers"
        class="inline-flex items-center gap-2 text-[#0D7377] font-medium hover:text-[#0a5c5f] transition-colors">
        Meet Our Trainers
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </a>
    </section>

    <!-- Certifications & Affiliations -->
    <section class="bg-slate-50 py-16 px-6">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-slate-800 mb-8 text-center">
          Certifications &amp; Affiliations
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          @for (org of affiliations; track org) {
            <div class="bg-white rounded-lg p-5 shadow-sm border border-slate-100 flex items-center justify-center text-center">
              <span class="text-sm font-medium text-slate-700">{{ org }}</span>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-br from-[#0D7377] to-[#0a5c5f] py-16 px-6">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Ready to Start?</h2>
        <p class="text-teal-100 mb-8">
          Take the first step toward a happier, better-behaved dog. Book a
          session today and see the PawForward difference.
        </p>
        <a routerLink="/book"
          class="inline-block bg-[#F59E0B] hover:bg-[#d97706] text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg">
          Book a Session
        </a>
      </div>
    </section>
  `,
})
export class AboutPageComponent {
  affiliations = [
    'Certification Council for Professional Dog Trainers (CCPDT)',
    'Association of Professional Dog Trainers (APDT)',
    'International Association of Animal Behavior Consultants (IAABC)',
    'American Kennel Club (AKC)',
  ];
}
