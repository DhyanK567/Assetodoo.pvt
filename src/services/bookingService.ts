export interface ResourceBooking {
  id: string;
  assetId: string;
  userId: string;
  purpose: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

const MOCK_TODAY = '2026-08-30';
const MOCK_TIME = '22:15';
const MOCK_NOW_STR = `${MOCK_TODAY}T${MOCK_TIME}`;

const DEFAULT_BOOKINGS: ResourceBooking[] = [
  {
    id: 'book_1',
    assetId: 'ast_3', // Keysight Oscilloscope
    userId: 'usr_employee',
    purpose: 'Analog circuit filter attenuation testing.',
    date: '2026-08-30',
    startTime: '09:00',
    endTime: '11:00',
    status: 'completed'
  },
  {
    id: 'book_2',
    assetId: 'ast_4', // Projector 4K
    userId: 'usr_manager',
    purpose: 'Department Q3 roadmap presentation review.',
    date: '2026-08-30',
    startTime: '14:00',
    endTime: '16:00',
    status: 'completed'
  },
  {
    id: 'book_3',
    assetId: 'ast_3', // Keysight Oscilloscope
    userId: 'usr_dept_head',
    purpose: 'Laboratory demonstration for compliance standards check.',
    date: '2026-08-31',
    startTime: '10:00',
    endTime: '12:00',
    status: 'upcoming'
  },
  {
    id: 'book_4',
    assetId: 'ast_4', // Projector 4K
    userId: 'usr_employee',
    purpose: 'Night-shift remote firmware sync demonstration.',
    date: '2026-08-30',
    startTime: '22:00',
    endTime: '23:30',
    status: 'ongoing' // Ongoing since mock now is 22:15
  }
];

class BookingService {
  private getStorageItem<T>(key: string, defaults: T[]): T[] {
    const data = localStorage.getItem(key);
    try {
      return data ? JSON.parse(data) : this.setStorageItem(key, defaults);
    } catch {
      return this.setStorageItem(key, defaults);
    }
  }

  private setStorageItem<T>(key: string, value: T[]): T[] {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  public getBookings(): ResourceBooking[] {
    const list = this.getStorageItem<ResourceBooking>('MOCK_DB_BOOKINGS', DEFAULT_BOOKINGS);
    // Dynamically update status values based on current mock time before returning
    return list.map(b => ({
      ...b,
      status: this.resolveStatus(b)
    }));
  }

  private resolveStatus(booking: ResourceBooking): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' {
    if (booking.status === 'cancelled') return 'cancelled';

    const startDateTime = `${booking.date}T${booking.startTime}`;
    const endDateTime = `${booking.date}T${booking.endTime}`;

    if (MOCK_NOW_STR < startDateTime) {
      return 'upcoming';
    } else if (MOCK_NOW_STR >= startDateTime && MOCK_NOW_STR <= endDateTime) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  }

  public checkOverlap(
    assetId: string, 
    date: string, 
    start: string, 
    end: string, 
    excludeId?: string
  ): boolean {
    const list = this.getBookings().filter(b => 
      b.assetId === assetId && 
      b.date === date && 
      b.status !== 'cancelled' && 
      b.id !== excludeId
    );

    // Checks overlap interval algorithm
    // start1 < end2 && start2 < end1
    return list.some(b => {
      const s1 = b.startTime;
      const e1 = b.endTime;
      const s2 = start;
      const e2 = end;

      return s1 < e2 && s2 < e1;
    });
  }

  public createBooking(
    assetId: string, 
    userId: string, 
    purpose: string, 
    date: string, 
    startTime: string, 
    endTime: string
  ): { success: boolean; error?: string; booking?: ResourceBooking } {
    if (this.checkOverlap(assetId, date, startTime, endTime)) {
      return { 
        success: false, 
        error: 'Overlap Collision: The selected time interval overlaps with an existing reservation.' 
      };
    }

    const bookings = this.getBookings();
    const newBooking: ResourceBooking = {
      id: `book_${Math.random().toString(36).substring(2, 9)}`,
      assetId,
      userId,
      purpose,
      date,
      startTime,
      endTime,
      status: 'upcoming'
    };

    bookings.push(newBooking);
    this.setStorageItem('MOCK_DB_BOOKINGS', bookings);

    return { success: true, booking: newBooking };
  }

  public cancelBooking(id: string): ResourceBooking[] {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx > -1) {
      bookings[idx].status = 'cancelled';
    }
    return this.setStorageItem('MOCK_DB_BOOKINGS', bookings);
  }

  public rescheduleBooking(
    id: string, 
    date: string, 
    start: string, 
    end: string
  ): { success: boolean; error?: string } {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.id === id);
    if (!booking) return { success: false, error: 'Booking not found.' };

    if (this.checkOverlap(booking.assetId, date, start, end, id)) {
      return { 
        success: false, 
        error: 'Overlap Collision: The new time slot overlaps with another reservation.' 
      };
    }

    const idx = bookings.findIndex(b => b.id === id);
    if (idx > -1) {
      bookings[idx].date = date;
      bookings[idx].startTime = start;
      bookings[idx].endTime = end;
      // Reset status so resolveStatus can recompute it
      if (bookings[idx].status === 'cancelled') {
        bookings[idx].status = 'upcoming';
      }
    }

    this.setStorageItem('MOCK_DB_BOOKINGS', bookings);
    return { success: true };
  }
}

export const bookingService = new BookingService();
export { MOCK_TODAY, MOCK_TIME };
