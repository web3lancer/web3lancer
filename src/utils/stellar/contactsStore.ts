import { v4 as uuidv4 } from "uuid";
import { StrKey } from "@stellar/stellar-sdk";

// Define the Contact interface
export interface Contact {
  id: string;
  name: string;
  address: string;
  favorite: boolean;
}

// Function to create a contacts store
function createContactsStore() {
  // Initialize the state from localStorage or with an empty array
  const getInitialState = (): Contact[] => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('web3lancer:contactList');
      if (storedData) {
        return JSON.parse(storedData);
      }
    }
    return [];
  };

  // Store the current state
  let contacts = getInitialState();
  
  // Subscribe function for reactivity
  const subscribers = new Set<(contacts: Contact[]) => void>();

  // Update state and notify subscribers
  const setState = (newContacts: Contact[]) => {
    contacts = newContacts;
    if (typeof window !== 'undefined') {
      localStorage.setItem('web3lancer:contactList', JSON.stringify(contacts));
    }
    subscribers.forEach(callback => callback(contacts));
  };

  return {
    // Subscribe to state changes
    subscribe: (callback: (contacts: Contact[]) => void) => {
      subscribers.add(callback);
      callback(contacts); // Call immediately with current value
      
      // Return unsubscribe function
      return () => {
        subscribers.delete(callback);
      };
    },

    // Get current state
    getState: () => contacts,

    // Erases all contact entries
    empty: () => setState([]),

    // Removes the specified contact entry
    remove: (id: string) => {
      const filteredContacts = contacts.filter(contact => contact.id !== id);
      setState(filteredContacts);
    },

    // Adds a new contact entry
    add: (contact: Omit<Contact, 'id'>) => {
      try {
        if (!StrKey.isValidEd25519PublicKey(contact.address)) {
          throw new Error('Invalid public key');
        }
        
        const newContact = { ...contact, id: uuidv4() };
        setState([...contacts, newContact]);
        return newContact;
      } catch (err) {
        console.error('Error adding contact:', err);
        throw new Error(`Failed to add contact: ${err instanceof Error ? err.message : String(err)}`);
      }
    },

    // Toggles the "favorite" field
    favorite: (id: string) => {
      const updatedContacts = contacts.map(contact => {
        if (contact.id === id) {
          return { ...contact, favorite: !contact.favorite };
        }
        return contact;
      });
      setState(updatedContacts);
    },

    // Searches for a contact by address
    lookup: (address: string): string | false => {
      const contact = contacts.find(contact => contact.address === address);
      return contact ? contact.name : false;
    },
  };
}

// Export the contacts store
export const contactsStore = createContactsStore();
