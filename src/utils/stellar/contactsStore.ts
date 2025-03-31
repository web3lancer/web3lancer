// Define the Contact interface
export interface Contact {
  id: string;
  name: string;
  address: string;
  favorite: boolean;
}

// Local storage key for contacts
const STORAGE_KEY = 'stellar_contacts';

/**
 * ContactsStore for managing Stellar address contacts
 */
class ContactsStore {
  private contacts: Contact[] = [];
  private listeners: Array<(contacts: Contact[]) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load contacts from local storage
   */
  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        this.contacts = JSON.parse(savedData);
        this.notifyListeners();
      } catch (err) {
        console.error('Failed to parse contacts from storage:', err);
      }
    }
  }

  /**
   * Save contacts to local storage
   */
  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.contacts));
    this.notifyListeners();
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners() {
    for (const listener of this.listeners) {
      listener([...this.contacts]);
    }
  }

  /**
   * Subscribe to contacts changes
   */
  subscribe(listener: (contacts: Contact[]) => void) {
    this.listeners.push(listener);
    // Immediately notify the new listener of current contacts
    listener([...this.contacts]);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Add a new contact
   */
  addContact(contact: Omit<Contact, 'id'>): Contact {
    // Check if contact with the same address already exists
    if (this.contacts.some(c => c.address === contact.address)) {
      throw new Error('A contact with this address already exists');
    }
    
    const newContact: Contact = {
      ...contact,
      id: crypto.randomUUID ? crypto.randomUUID() : `contact_${Date.now()}_${Math.random()}`
    };
    
    this.contacts.push(newContact);
    this.saveToStorage();
    
    return newContact;
  }

  /**
   * Remove a contact by ID
   */
  removeContact(id: string): boolean {
    const initialLength = this.contacts.length;
    this.contacts = this.contacts.filter(c => c.id !== id);
    
    if (this.contacts.length !== initialLength) {
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  /**
   * Toggle favorite status of a contact
   */
  toggleFavorite(id: string): boolean {
    const contact = this.contacts.find(c => c.id === id);
    
    if (contact) {
      contact.favorite = !contact.favorite;
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  /**
   * Update a contact
   */
  updateContact(id: string, updates: Partial<Omit<Contact, 'id'>>): boolean {
    const contact = this.contacts.find(c => c.id === id);
    
    if (contact) {
      Object.assign(contact, updates);
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  /**
   * Get all contacts
   */
  getContacts(): Contact[] {
    return [...this.contacts];
  }

  /**
   * Get favorite contacts
   */
  getFavoriteContacts(): Contact[] {
    return this.contacts.filter(c => c.favorite);
  }

  /**
   * Lookup a contact name by address
   */
  lookupByAddress(address: string): Contact | undefined {
    return this.contacts.find(c => c.address === address);
  }

  /**
   * Clear all contacts
   */
  clear() {
    this.contacts = [];
    this.saveToStorage();
  }
}

// Create a singleton instance
export const contactsStore = new ContactsStore();
