import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContactModal from '../features/contact/components/ContactModal.jsx';

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 40px' }}>
      <ContactModal isOpen={true} onClose={() => navigate('/')} />
    </div>
  );
}
