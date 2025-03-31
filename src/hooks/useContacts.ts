import { useState, useEffect } from 'react';
import { contactsStore, Contact } from '@/utils/stellar/contactsStore';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [favoriteContacts, setFavoriteContacts] = useState<Contact[]>([]);

  useEffect(() => {
    // Subscribe to contact changes
    const unsubscribe = contactsStore.subscribe((updatedContacts) => {
      setContacts(updatedContacts);
      setFavoriteContacts(updatedContacts.filter(c => c.favorite));
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const addContact = (contact: Omit<Contact, 'id'>) => {
    return contactsStore.addContact(contact);
  };

  const removeContact = (id: string) => {
    return contactsStore.removeContact(id);
  };

  const toggleFavorite = (id: string) => {
    return contactsStore.toggleFavorite(id);
  };

  const updateContact = (id: string, updates: Partial<Omit<Contact, 'id'>>) => {
    return contactsStore.updateContact(id, updates);
  };

  const lookupContact = (address: string): string | null => {
    const contact = contactsStore.lookupByAddress(address);
    return contact ? contact.name : null;
  };

  return {
    contacts,
    favoriteContacts,
    addContact,
    removeContact,
    toggleFavorite,
    updateContact,
    lookupContact
  };
}
