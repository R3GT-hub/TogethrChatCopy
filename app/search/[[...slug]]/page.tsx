"use client";
// import  WebSocket  from 'websocket';

// import  {w3cwebsocket as WebSocket } from 'websocket';
// import io from 'socket.io-client';

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/shared/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCarousel from "@/components/ProductCarousel";
import useSmoothScrollIntoView from "@/hooks/autoscroll";
import Followup from "@/components/Followup";
import { ResearchComponent } from "@/components/ResearchComponent";
import ResearchLoader from "@/components/shared/ResearchLoader"

 const ws = new WebSocket('wss://govoyr.com/ws/1213');

interface Params {
  slug: string[];
}

interface Message {
  sender: string;
  // content: string;
  content: JSX.Element | string | null;
}

interface Product {
  title: string;
  rating: number;
  prices: number[];
  media: { link: string }[];
  sellers_results: { online_sellers: { link: string }[] };
}

const item = {
  title: "Section 1",
  content: "Content for section 1",
};

export default function Page({ params }: { params: Params }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [isConversationIdLoaded, setIsConversationIdLoaded] = useState(false);

  const [inputWidth, setInputWidth] = useState<number | null>(null); // Specify type explicitly
  const inputRef = useRef<HTMLInputElement>(null); // Specify type explicitly

  const [convnId, setConversationId] = useState("");
  const [productArray, setProductArray] = useState<any[]>([]);

  const { slug } = params;
  const userId = slug[0];
  const searchQuery = slug[1];

  const [containerWidth, setContainerWidth] = useState<number>(0); // Specify the type as number
  const containerRef = useRef<HTMLDivElement>(null); // Specify the type as HTMLDivElement
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => {
      window.removeEventListener("resize", updateContainerWidth);
    };
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageSentRef = useRef<boolean>(false);
  const authTokenRef = useRef<string | null>(null); // Ref to hold the authentication token

  // fetch authtoken from localstorage.
  useEffect(() => {
    const fetchAuthToken = async () => {
      const token = localStorage.getItem("token");
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
      // setUserMessage(decodeURIComponent(searchQuery));
      messageSentRef.current = true; // Update the flag
    }
  }, [searchQuery]); // Empty dependency array to trigger only once when component mounts

  //attempt2
  //generating conversation ID.
  useEffect(() => {
    const storedConversationId = sessionStorage.getItem("conversationId");
    let isNewIdGenerated = false; // Flag to track if a new ID was generated

    // Check if stored conversation ID exists
    if (storedConversationId) {
      setConversationId(storedConversationId);
    } else {
      // If stored conversation ID doesn't exist, check if the page is refreshed
      if (window.performance.navigation.type === 1 || window.performance.navigation.type == 0) {
        const generateNewConversationId = async () => {
          try {
            const response = await fetch(
              "https://govoyr.com/api/WebChatbot/conversationId",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${authTokenRef.current}`,
                },
                body: JSON.stringify({
                  platform: "web",
                }),
              }
            );
            if (response.ok) {
              const data = await response.json();
              const newConversationId = data.ConversationId;
              sessionStorage.setItem("conversationId", newConversationId);
              setConversationId(newConversationId);
              isNewIdGenerated = true; // Set the flag indicating a new ID was generated
            } else {
              console.error(
                "Failed to fetch conversation ID:",
                response.statusText
              );
            }
          } catch (error) {
            console.error("Error fetching conversation ID:", error);
          }
        };

        generateNewConversationId();
      }
    }

    // If a new ID was not generated, set the conversation ID using the stored value
    if (!isNewIdGenerated && storedConversationId) {
      setConversationId(storedConversationId);
    }
  }, [authTokenRef]); // Include authTokenRef as a dependency if it's used inside the effect

  


  // handle input change
  const handleInputChange = (newValue: string) => {
    setUserMessage(newValue);
  };

  

  //attempt 4

  // const sendMessage = async (message: string) => {
  //   setIsLoading(true);

  //   const conversationId = sessionStorage.getItem("conversationId");
  //   if (!conversationId) {
  //     console.error("Conversation ID not found in local storage.");
  //     setIsLoading(false);
  //     return;
  //   }

  //   const newMessage: Message = { sender: "user", content: message };
  //   setMessages((prevMessages) => [...prevMessages, newMessage]);
  //   setUserMessage("");

  //   try {
  //     ws.onopen = (event) => {
  //       console.log('LOG:: Connected ',event);
  //     }
  
  //     ws.onclose = (event) => {
  //       console.log('LOG:: Closed ',event);
  //     }
  
  //     ws.onmessage = (event) => {
  //       console.log('LOG:: onMessage ',event);
  //     }
  
  //     ws.onerror = (event) => {
  //       console.log('LOG:: Error',event);
  //     }
  
  //     // send message after 2 secs  
  //     setTimeout(()=>{
  //       ws.send('I am trying');
  //     },2000);
      
  //     const response = await fetch(
  //       "https://govoyr.com/api/WebChatbot/message",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${authTokenRef.current}`,
  //         },
  //         body: JSON.stringify({
  //           userMessage: message,
  //           id: conversationId,
  //           // id:convnId,
  //         }),
  //       }
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("Response from backend:", data);

  //       const aiResponse = data.AI_Response;
  //       console.log("AI Response:", aiResponse);

  //       const isCurationRequired = data.curration; // Corrected spelling
  //       const isPdtFlag = data.productFlag;

  //       console.log("Is Curation Required:", isCurationRequired);
  //       console.log("Is Product Flag:", isPdtFlag);

  //       const newAiMessage: Message = { sender: "AI", content: aiResponse };
  //       setMessages((prevMessages) => [...prevMessages, newAiMessage]);

  //       if (isCurationRequired) {
  //         if (!isPdtFlag && aiResponse.products === undefined) {
  //           const productResponse = await fetch(
  //             "https://govoyr.com/api/WebChatbot/product",
  //             {
  //               method: "POST",
  //               headers: {
  //                 "Content-Type": "application/json",
  //                 Authorization: `Bearer ${authTokenRef.current}`,
  //               },
  //               body: JSON.stringify({
  //                 MessageId: data.MessageId,
  //               }),
  //             }
  //           );

  //           if (productResponse.ok) {
  //             const productData = await productResponse.json();
  //             console.log(productData);

  //             const formattedProducts: Product[] = productData.map(
  //               (product: any) => ({
  //                 title: product.title,
  //                 rating: product.rating,
  //                 prices: product.prices,
  //                 media: product.media,
  //                 sellers_results: product.sellers_results,
  //               })
  //             );

  //             const productAiMessage: Message = {
  //               sender: "AI",
  //               content: <ProductCarousel products={formattedProducts} />,
  //             };
  //             setMessages((prevMessages) => [
  //               ...prevMessages,
  //               productAiMessage,
  //             ]);
  //           } else {
  //             console.error(
  //               "Failed to fetch products:",
  //               productResponse.statusText
  //             );
  //           }
  //         } else if (isPdtFlag || data.products !== undefined) {
  //           const productsFromAI = data.products || [];
  //           console.log(aiResponse.products);
  //           console.log(productsFromAI);
  //           const formattedProducts: Product[] = productsFromAI.map(
  //             (product: any) => ({
  //               title: product.title,
  //               rating: product.rating,
  //               prices: product.prices,
  //               media: product.media,
  //               sellers_results: product.sellers_results,
  //             })
  //           );
  //           const productAiMessage: Message = {
  //             sender: "AI",
  //             content: <ProductCarousel products={formattedProducts} />,
  //           };
  //           setMessages((prevMessages) => [...prevMessages, productAiMessage]);
  //         }
  //       }
  //     } else {
  //       console.error("Failed to send message:", response.statusText);
  //     }
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  //attempt5 send message 
  const sendMessage = async (message: string) => {
    setIsLoading(true);
  
    // Check if conversationId exists in session storage
    let conversationId = sessionStorage.getItem("conversationId");
    
    // If conversationId doesn't exist, wait for 500ms to retry fetching
    if (!conversationId) {
      await new Promise(resolve => setTimeout(resolve, 500));
      conversationId = sessionStorage.getItem("conversationId");
      
      // If conversationId still doesn't exist, log error and return
      if (!conversationId) {
        console.error("Conversation ID not found in local storage after timeout.");
        setIsLoading(false);
        return;
      }
    }
  
    const newMessage: Message = { sender: "user", content: message };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserMessage("");
  
    try {
      // WebSocket setup
      ws.onopen = (event) => {
        console.log('LOG:: Connected ',event);
      }
  
      ws.onclose = (event) => {
        console.log('LOG:: Closed ',event);
      }
  
      ws.onmessage = (event) => {
        console.log('LOG:: onMessage ',event);
      }
  
      ws.onerror = (event) => {
        console.log('LOG:: Error',event);
      }
  
      // send message after 2 secs  
      setTimeout(()=>{
        ws.send('I am trying');
      },2000);
  
      const response = await fetch(
        "https://govoyr.com/api/WebChatbot/message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authTokenRef.current}`,
          },
          body: JSON.stringify({
            userMessage: message,
            id: conversationId,
          }),
        }
      );
  
      // Handle response
      if (response.ok) {
        const data = await response.json();
        console.log("Response from backend:", data);
  
        const aiResponse = data.AI_Response;
        console.log("AI Response:", aiResponse);
  
        const isCurationRequired = data.curration; // Corrected spelling
        const isPdtFlag = data.productFlag;
  
        console.log("Is Curation Required:", isCurationRequired);
        console.log("Is Product Flag:", isPdtFlag);
  
        const newAiMessage: Message = { sender: "AI", content: aiResponse };
        setMessages((prevMessages) => [...prevMessages, newAiMessage]);
  
        if (isCurationRequired) {
          if (!isPdtFlag && aiResponse.products === undefined) {
            const productResponse = await fetch(
              "https://govoyr.com/api/WebChatbot/product",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${authTokenRef.current}`,
                },
                body: JSON.stringify({
                  MessageId: data.MessageId,
                }),
              }
            );
  
            if (productResponse.ok) {
              const productData = await productResponse.json();
              console.log(productData);
  
              const formattedProducts: Product[] = productData.map(
                (product: any) => ({
                  title: product.title,
                  rating: product.rating,
                  prices: product.prices,
                  media: product.media,
                  sellers_results: product.sellers_results,
                })
              );
  
              const productAiMessage: Message = {
                sender: "AI",
                content: <ProductCarousel products={formattedProducts} />,
              };
              setMessages((prevMessages) => [
                ...prevMessages,
                productAiMessage,
              ]);
            } else {
              console.error(
                "Failed to fetch products:",
                productResponse.statusText
              );
            }
          } else if (isPdtFlag || data.products !== undefined) {
            const productsFromAI = data.products || [];
            console.log(aiResponse.products);
            console.log(productsFromAI);
            const formattedProducts: Product[] = productsFromAI.map(
              (product: any) => ({
                title: product.title,
                rating: product.rating,
                prices: product.prices,
                media: product.media,
                sellers_results: product.sellers_results,
              })
            );
            const productAiMessage: Message = {
              sender: "AI",
              content: <ProductCarousel products={formattedProducts} />,
            };
            setMessages((prevMessages) => [...prevMessages, productAiMessage]);
          }
        }
      } else {
        console.error("Failed to send message:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  //function to trigger send message on pressing enter button
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

  // Call the custom hook to enable smooth auto-scrolling
  useSmoothScrollIntoView(messagesEndRef, [messages]); // Trigger auto-scrolling whenever messages change

  //set followupcomponent width
  // Calculate input width
  useEffect(() => {
    if (inputRef.current) {
      setInputWidth(inputRef.current.offsetWidth);
    }
  }, []);


  //websocket 

    // const storedConversationId = sessionStorage.getItem("conversationId");
    // const ws = new WebSocket(`wss://govoyr.com/ws/${storedConversationId}`);
  

    // Establish WebSocket connection
    // const socket = new WebSocket(`wss://govoyr.com/ws/${storedConversationId}`);

    // Event listeners for WebSocket events
    // socket.onopen = () => {
    //   console.log('WebSocket connection established');
    // };

    // socket.onmessage = (event) => {
    //   console.log('Message received:', event.data);
    // };

    // socket.onclose = () => {
    //   console.log('WebSocket connection closed');
    // };

    // // Clean up WebSocket connection on unmount
    // return () => {
    //   socket.close();
    // };
// Empty dependency array ensures effect runs only once



  return (
    <main className="bg-[#111111]">
      <Navbar />

      <section className="flex justify-center h-full mb-16 bp-0  ">
        <div className="md:max-w-2xl md:min-w-[42rem] max-w-md  mt-5 mb-10 h-full p-0 overflow-hidden ">
          {/* attempt 1 */}
          {messages.map((message, index) => (
            <>
              <div
                key={index}
                className={`flex flex-row gap-4 mx-1 md:mx-6 my-5 ${
                  message.sender === "AI" ? "justify-start" : "justify-end"
                }`}
              >
                {/* atempt 2 */}
                {/* Render AI messages */}
                {message.sender === "AI" ? (
                  <>
                    <Avatar className="shadow-md z-10">
                      <AvatarImage src="/ai3.png" />
                      <AvatarFallback>bot</AvatarFallback>
                    </Avatar>

                    <div className="flex w-max max-w-[75%] font-medium flex-col gap-2 rounded-xl shadow-lg px-3 py-2 text-xs md:text-sm text-[#DDDDDD] bg-[#1A1A1A]">
                      {typeof message.content === "string" ? (
                        <div className="response-content">
                          {message.content.split("\n").map((paragraph, i) => (
                            <div key={i}>
                              {paragraph.split("\n").map((line, idx) => {
                                const boldRegex = /\*\*([^*]*)\*\*/g;
                                let parts = line.split(boldRegex);
                                parts = parts.filter(Boolean); // Remove empty parts

                                return (
                                  <span key={idx}>
                                    {parts.map((part, index) => {
                                      return boldRegex.test(part) ? (
                                        <strong key={index}>{part}</strong>
                                      ) : (
                                        <span key={index}>{part}</span>
                                      );
                                    })}
                                    <br />
                                  </span>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          {Array.isArray(message.content) &&
                          message.content.length > 0 ? (
                            // Render ProductCarousel
                            <div>{message.content}</div>
                          ) : (
                            // Render other types of content
                            <div>{message.content}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Render user messages
                  <>
                    <div className="flex w-max max-w-[75%] flex-col items-center justify-center font-medium  gap-2 rounded-xl shadow-lg px-3 py-2 text-xs md:text-sm ml-auto bg-[#0C8CE9] text-primary-foreground">
                      {message.content}
                    </div>
                    <Avatar className="shadow-lg z-10">
                      <AvatarImage src="/user.png" className="z-10" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </>
                )}
              </div>
            </>
          ))}

          {/* <ResearchLoader/> */}

          {productArray.length > 0 && (
            <ProductCarousel products={productArray} />
          )}

          {/* <ResearchComponent/> */}

          {/* message loader */}
          {isLoading && (
            <div className="flex items-center space-x-4 mx-1 md:mx-6">
              <Avatar className="shadow-md z-10">
                <AvatarImage src="/ai3.png" />
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
            ref={inputRef}
            type="email"
            placeholder="Find your product"
            className="transition border-[#141414] bg-black shadow-lg text-white rounded-xl h-full z-1000"
            value={userMessage}
            onChange={(e) => handleInputChange(e.target.value)}
          />

          {/* <Followup containerWidth={containerWidth}/> */}

          <Button
            type="submit"
            className="bg-[#0C8CE9] hover:bg-[#0c8de99a] font-medium text-2xl md:text-2xl lg:text-3xl rounded-xl  h-[58px]  w-[58px] md:w-[65px]"
            onClick={() => sendMessage(userMessage)}
            disabled={!userMessage.trim() || isLoading}
          >
            &gt;
          </Button>
        </div>
      </footer>
    </main>
  );
}
