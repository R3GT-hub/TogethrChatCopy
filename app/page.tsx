'use client'
import { useState, useEffect } from 'react';
import Navbar from "../components/shared/Navbar";
import { ChatInput } from "@/components/shared/ChatInput";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [selectedText, setSelectedText] = useState("");
  const [guestID, setGuestID] = useState("");
  const [token, setToken] = useState("");


  // guestsignup and localstorage logic
  useEffect(() => {
    const storedGuestID = localStorage.getItem('guestID');
    const storedToken = localStorage.getItem('token');
    
    if (storedGuestID && storedToken) {
      setGuestID(storedGuestID);
      setToken(storedToken);
    } else {
      // Fetch API only if guestID and token are not stored in local storage
      fetchGuestAuthSignup();
    }
  }, []);

  const fetchGuestAuthSignup = async () => {
    try {
      const response = await fetch('http://43.205.216.141/api/guest-auth/signup');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setGuestID(data.guest.GuestId);
      setToken(data.token);
      // Store guestID and token in local storage
      localStorage.setItem('guestID', data.guest.GuestId);
      localStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  const handleInputChange = (newValue: string) => {
    setSelectedText(newValue);
  };

  const buttons = [
    "Best Performance laptop?",
    "Best headphones in 2024?",
    "Compare iphone 14 and Iphone 15",
    "Electronics",
    "Fashion",
    "Sports gears"
  ];

  const handleBadgeClick = (text: string) => {
    setSelectedText(text);
  };

  const userId = guestID;


  return (
    <>
      <main className="bg-[#F4F7FE]">
        <Navbar />
        <div className="flex flex-col items-center justify-center my-28 ">
          <div className='w-full md:w-2/3 flex justify-start md:justify-center mb-4 px-4'>
            
          <h1 className="font-semibold text-[35px] md:text-3xl lg:text-4xl text-[#1B2559]">Lets Shop Togethr</h1>
          </div>
          
          <div className='w-full flex justify-center mx-18 px-[15px]'>
            <ChatInput initialText={selectedText} onInputChange={handleInputChange} searchQuery={userId} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3  my-6 gap-2">
            {buttons.map((text, index) => (
              <Badge
                key={index}
                className="text-[10px] hover:cursor-pointer bg-white text-[#51636F] font-medium hover:bg-[#2D29F8] hover:text-white py-1 flex items-center justify-center transition ease-in-out shadow-sm"
                onClick={() => handleBadgeClick(text)}
              >
                {text}
              </Badge>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
