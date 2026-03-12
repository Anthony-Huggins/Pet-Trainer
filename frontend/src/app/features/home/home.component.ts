import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="min-h-screen">
      <section
        class="relative bg-gradient-to-br from-teal-700 to-teal-900 text-white py-24 px-6"
      >
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-5xl font-bold mb-6">
            Professional Dog Training That Gets Results
          </h1>
          <p class="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
            From puppy basics to advanced agility &mdash; PawForward Academy
            builds confident, well-behaved dogs through positive reinforcement
            training.
          </p>
          <div class="flex gap-4 justify-center">
            <a
              routerLink="/book"
              class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-lg transition"
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

      <section class="py-16 px-6 bg-gray-50">
        <div class="max-w-6xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-slate-800 mb-12">
            Our Training Programs
          </h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div
              class="bg-white rounded-xl shadow-sm border-t-4 border-teal-600 p-8 hover:shadow-md transition"
            >
              <h3 class="text-xl font-semibold mb-3">Private Training</h3>
              <p class="text-slate-600">
                One-on-one sessions tailored to your dog's specific needs.
              </p>
            </div>
            <div
              class="bg-white rounded-xl shadow-sm border-t-4 border-amber-500 p-8 hover:shadow-md transition"
            >
              <h3 class="text-xl font-semibold mb-3">Group Classes</h3>
              <p class="text-slate-600">
                Socialization and learning in a fun group environment.
              </p>
            </div>
            <div
              class="bg-white rounded-xl shadow-sm border-t-4 border-red-400 p-8 hover:shadow-md transition"
            >
              <h3 class="text-xl font-semibold mb-3">Board & Train</h3>
              <p class="text-slate-600">
                Intensive programs where your dog stays and learns with us.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  imports: [],
})
export class HomeComponent {}
