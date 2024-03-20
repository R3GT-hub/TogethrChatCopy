'use client'
import { useState, useEffect , useRef } from 'react';
import Navbar from "@/components/shared/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IoIosArrowForward } from "react-icons/io";
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton"


import Loader from "@/components/shared/Loader";

interface Params {
  slug: string[];
}

interface Message {
  sender: string;
  content: string;
}

export default function Page({ params }: { params: Params }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageSent, setMessageSent] =  useState(false);

  const { slug } = params;
  const userId = slug[0];
  const searchQuery = slug[1];

  const router = useRouter();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageSentRef = useRef<boolean>(false);
  const authTokenRef = useRef<string | null>(null); // Ref to hold the authentication token

// fetch authtoken from localstorage. 
useEffect(() => {
  const fetchAuthToken = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      authTokenRef.current = token;
    } else {
      console.log("token not found");
    }
  };
fetchAuthToken();
}, []);



  // decoding the user query from URL and setting in the input field as soon as we come on this page
  useEffect(() => {
    if (searchQuery && !messageSentRef.current) {
      sendMessage(decodeURIComponent(searchQuery));
      messageSentRef.current = true; // Update the flag
    }
  }, [searchQuery]); // Empty dependency array to trigger only once when component mounts
  


  

  const handleInputChange = (newValue: string) => {
    setUserMessage(newValue);
  };

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    const newMessage: Message = { sender: 'user', content: message };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setUserMessage("");

    try {

      //
    //   let authToken = localStorage.getItem('token');
    // if (!authToken) {
    //   throw new Error('Authentication token not found.');
    // }
  

      const response = await fetch('https://govoyr.com/api/WebChatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${authToken}`,
          'Authorization': `Bearer ${authTokenRef.current}`,
        },
        body: JSON.stringify({
          userMessage: message,
          id: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.AI_Response;
        console.log(data);
        let aiContent = typeof aiResponse === 'string' ? aiResponse : ''; // Check if aiResponse is a string
        const newAiMessage: Message = { sender: 'AI', content: aiContent };
        setMessages(prevMessages => [...prevMessages, newAiMessage]);
      } else {
        console.error('Failed to send message:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && userMessage.trim() !== "") {
        sendMessage(userMessage);
        // setMessageSent(true);
      }
    };
  
    document.addEventListener("keydown", handleKeyDown);
  
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMessage]); // Include messageSent in the dependency array
  




  //

  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (event.key === "Enter") {
  //       sendMessage(userMessage);
  //     }
  //   };

  //   document.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [userMessage]); // Add userMessage as dependency

  // const [authToken, setAuthToken] = useState<string | null>(null);

  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     setAuthToken(token);
  //   }
  // }, []);


  //

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="bg-[#111111]">
      <Navbar/>


      <section className="flex justify-center h-full mb-16 bp-0  ">
         
{/* max-w-sm md:min-w-[42rem] */}
{/* min-w-[398px] -- for mobiles , breaking at some points */}
        <div className="md:max-w-2xl md:min-w-[42rem] max-w-md  mt-5 mb-10 h-full p-0 overflow-hidden ">
          { messages.map((message, index) => (
            <div key={index} className={`flex flex-row gap-4 mx-1 md:mx-6 my-5 ${message.sender === 'AI' ? 'justify-start' : 'justify-end'}`}>
              {message.sender === 'AI' ? (
                <>
                  <Avatar className="shadow-md z-10">
                    <AvatarImage src="/ai2.png" />
                    <AvatarFallback>bot</AvatarFallback>
                  </Avatar>
                  <div className="flex w-max max-w-[75%]  font-medium flex-col gap-2 rounded-xl shadow-lg px-3 py-2 text-xs md:text-sm text-[#DDDDDD] bg-[#1A1A1A]">
                    {/* {message.content.split('\n').map((paragraph, i) => (
                      <div key={i}>
                        {paragraph.split('\n').map((line, idx) => {
                          if (/^\d+\./.test(line.trim())){
                            return <span key={idx}>{line.trim()}<br /></span>;
                          } else {
                            return <span key={idx}>{line.trim()}</span>;
                          }
                        })}
                      </div>
                    ))} */}
                    {typeof message.content === 'string' ? (
  message.content.split('\n').map((paragraph, i) => (
    <div key={i}>
      {paragraph.split('\n').map((line, idx) => {
        if (/^\d+\./.test(line.trim())){
          return <span key={idx}>{line.trim()}<br /></span>;
        } else {
          return <span key={idx}>{line.trim()}</span>;
        }
      })}
    </div>
  ))
) : (
  <div>{message.content}</div> // Render the content as is if it's not a string
)}
                  </div>
                  {/*  */}

                </>
              ) : (
                <>
                  <div className="flex w-max max-w-[75%] flex-col font-medium gap-2 rounded-xl shadow-lg px-3 py-2 text-xs md:text-sm ml-auto bg-[#0C8CE9] text-primary-foreground">
                    {message.content}
                  </div>
                  <Avatar className="shadow-lg z-10">
                    <AvatarImage src="/human.png" className='z-10' />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-4 mx-1 md:mx-6">
               <Avatar className="shadow-md z-10">
                           <AvatarImage src="/ai2.png" />
                           <AvatarFallback>CN</AvatarFallback>
                         </Avatar>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px] md:w-[300px] bg-[#323232]" />
                  <Skeleton className="h-4 w-[250px] md:w-[265px] bg-[#323232]" />                  
                  <Skeleton className="h-4 w-[240px] md:w-[250px] bg-[#323232]" />                
                  </div>
              </div>
         
         )}
          <div ref={messagesEndRef} />

       
        </div>
      </section>

      <footer className="fixed bottom-0 w-full flex justify-center mt-5  p-5 bg-[#111111] z-50">
        <div className="flex w-full max-w-2xl h-[64px]  bg-[#1A1A1A] px-[6px] py-1 rounded-xl items-center space-x-2 z-1200">
          <Input
            type="email"
            placeholder="Find your product"
            className="transition border-[#141414] bg-black shadow-lg text-white rounded-xl h-full z-1000"
            value={userMessage}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <Button
            type="submit"
            className="bg-[#0C8CE9] hover:bg-[#0c8de99a] font-bold rounded-xl  h-[58px]  w-[58px] md:w-[65px]"
            onClick={() => sendMessage(userMessage)} // Pass userMessage to sendMessage function
            disabled={!userMessage.trim()}
          >
            <IoIosArrowForward className='h-2/3'/>
          </Button>
        </div>
      </footer>
    </main>
  );
}