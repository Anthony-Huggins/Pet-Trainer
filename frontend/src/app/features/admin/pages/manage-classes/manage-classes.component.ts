import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-manage-classes',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Manage Classes</h1>
          <p class="text-slate-500 mt-1">{{ classes().length }} class series</p>
        </div>
        <button class="inline-flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white font-medium rounded-lg hover:bg-amber-600 transition-colors text-sm">
          + Create Class Series
        </button>
      </div>

      <div class="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="text-left px-6 py-3 font-semibold text-slate-600">Title</th>
                <th class="text-left px-6 py-3 font-semibold text-slate-600">Trainer</th>
                <th class="text-left px-6 py-3 font-semibold text-slate-600">Day / Time</th>
                <th class="text-left px-6 py-3 font-semibold text-slate-600">Date Range</th>
                <th class="text-center px-6 py-3 font-semibold text-slate-600">Enrolled</th>
                <th class="text-center px-6 py-3 font-semibold text-slate-600">Waitlist</th>
                <th class="text-left px-6 py-3 font-semibold text-slate-600">Status</th>
                <th class="text-right px-6 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (cls of classes(); track cls.title) {
                <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4 font-medium text-slate-800">{{ cls.title }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ cls.trainer }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ cls.dayTime }}</td>
                  <td class="px-6 py-4 text-slate-500 text-xs">{{ cls.dateRange }}</td>
                  <td class="px-6 py-4 text-center text-slate-700 font-medium">{{ cls.enrolled }}/{{ cls.max }}</td>
                  <td class="px-6 py-4 text-center text-slate-600">{{ cls.waitlist }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [class]="statusBadge(cls.status)">
                      {{ cls.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button class="text-[#0D7377] hover:text-teal-800 font-medium text-xs mr-3">Edit</button>
                    <button class="text-[#F87171] hover:text-red-600 font-medium text-xs">Cancel</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class ManageClassesComponent {
  classes = signal([
    { title: 'Beginner Obedience', trainer: 'Dr. Emily Chen', dayTime: 'Tue & Thu, 10:00 AM', dateRange: 'Mar 4 - Apr 24, 2026', enrolled: 6, max: 8, waitlist: 2, status: 'Open' },
    { title: 'Advanced Agility', trainer: 'Marcus Rivera', dayTime: 'Sat, 9:00 AM', dateRange: 'Mar 7 - May 2, 2026', enrolled: 8, max: 8, waitlist: 4, status: 'Full' },
    { title: 'Puppy Kindergarten', trainer: 'Dr. Emily Chen', dayTime: 'Mon & Wed, 5:30 PM', dateRange: 'Feb 10 - Mar 19, 2026', enrolled: 3, max: 10, waitlist: 0, status: 'Cancelled' },
  ]);

  statusBadge(status: string): string {
    switch (status) {
      case 'Open': return 'bg-emerald-100 text-emerald-700';
      case 'Full': return 'bg-amber-100 text-amber-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
