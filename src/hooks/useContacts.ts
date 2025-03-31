import { useState, useEffect } from 'react';
import { contactsStore, Contact } from '@/utils/stellar/contactsStore';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(contactsStore.getState());
  const [favoriteContacts, setFavoriteContacts] = useState<Contact[]>([]);
  
  useEffect(() => {
    // Subscribe to changes in the contacts store
    const unsubscribe = contactsStore.subscribe((newContacts) => {
      setContacts(newContacts);
      setFavoriteContacts(newContacts.filter(contact => contact.favorite));
    });
    
    // Clean up subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    contacts,
    favoriteContacts,
    addContact: contactsStore.add,
    removeContact: contactsStore.remove,
    toggleFavorite: contactsStore.favorite,
    lookupContact: contactsStore.lookup,
    clearContacts: contactsStore.empty,
  };
}
