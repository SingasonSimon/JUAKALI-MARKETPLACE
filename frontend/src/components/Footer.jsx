import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Juakali Marketplace. All rights reserved.</p>
      </div>
    </footer>
  );
}