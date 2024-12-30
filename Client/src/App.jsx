import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const App = () => {
  let socket = useRef(null);
  let myname = useRef('');
  const [myID, setmyID] = useState('');
  const [mymsg, setmymsg] = useState('');
  const [Allmessages, setAllmessages] = useState([]);
  const [joinedusers, setjoinedusers] = useState([]);

  useEffect(() => {
    myname.current = prompt('Enter your name:'); // Prompt the user for their name
    socket.current = io('http://localhost:3000');

    // Store the user's socket ID
    socket.current.on('connect', () => setmyID(socket.current.id));

    // Notify the server about the joined user
    socket.current.emit('joined-user', { myname: myname.current });

    // Handle incoming messages
    socket.current.on('incomming-msg', ({ data }) => {
      setAllmessages((prev) => [...prev, data]); // Append the new message to the list
    });

    // Handle user join notifications
    socket.current.on('user-joined', (username) => {
      setjoinedusers((prev) => [...prev, username]); // Add the joined user to the list
    });

    return () => {
      socket.current.disconnect(); // Clean up on component unmount
    };
  }, []);

  const handleonsubmit = (e) => {
    e.preventDefault();

    // Send a message to the server
    socket.current.emit('send-msg', {
      message: mymsg,
      userID: myID,
      username: myname.current,
    });
    setmymsg('');
  };

  return (
    <>

      <div className="flex justify-center  items-center flex-col h-screen w-screen overflow-hidden gap-2">
        <h1 className='font-semibold text-3xl'>Capricorn chat App</h1>
        <div className="h-1/2 border-2 w-1/2 shadow-md p-10 overflow-y-auto bg-white">
          {joinedusers.map((username, indx) => (
            <div key={indx} className="text-center text-gray-400">
              {username} joined the chat
            </div>
          ))}

          {Allmessages.map((item, indx) => (
            <div
              key={indx}
              className={`flex gap-3 my-4 ${
                item.userID === myID ? 'justify-end' : 'justify-start'
              } w-full relative`}
            >
              <div
                className={`flex ${
                  item.userID === myID ? 'bg-emerald-500' : 'bg-blue-500'
                } px-4 py-2 rounded-md text-white shadow-md`}
              >
                {/* Display the sender's name at the top of the message */}
                <div className="font-bold text-sm flex justify-center items-center gap-4">
                  {item.username} :  <div>{item.message}</div>
                </div>
               
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleonsubmit} className="flex w-1/2 gap-3">
          <input
            type="text"
            value={mymsg}
            onChange={(e) => setmymsg(e.target.value)}
            className="px-4 shadow-md py-2 grow w-full outline-none border-2 bg-transparent"
          />
          <input
            type="submit"
            className=" bg-emerald-500 rounded-md text-white px-4 shadow-md py-2 grow outline-none"
          />
        </form>
      </div>
    </>
  );
};

export default App;
