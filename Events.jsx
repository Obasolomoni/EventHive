// import { useNavigate } from "react-router-dom";

// import Navbar from "./Navbar"
// import Footer from "./Footer"

// export default function Events({ events }) {
//   const navigate = useNavigate();

//   return (
//     <>
//     <Navbar/>
//     <div className="container mt-4">
     

//       <div className="mt-4">
//         {events.length === 0 ? (
//           <p>No events yet.</p>
//         ) : (
//           events.map((event) => (
//             <div className="card mb-3" key={event.id}>
//               <div className="card-body">
//                 <h4>{event.title}</h4>
//                 <p>{event.description}</p>

//                 <button
//                   className="btn btn-primary"
//                   onClick={() => navigate(`/event/${event.id}`)}
//                 >
//                   View Details
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//     <Footer/>
//     </>
//   );
// }
