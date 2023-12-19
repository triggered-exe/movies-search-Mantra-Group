
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const apiKey = process.env.REACT_APP_API_KEY || "c127b199f3msh88316e63d9644cap12f61cjsneed79b143e4c";


  useEffect(() => {
    // fetch movies and also fetch the further info of movies using movie id 
    const fetchData = async () => {
      try {
        const moviesOptions = {
          method: 'GET',
          url: 'https://movies-api14.p.rapidapi.com/movies',
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'movies-api14.p.rapidapi.com'
          }
        };

        const response = await axios.request(moviesOptions);
        console.log(response.data) // Log the response data for debugging purposes
        const moviesData = response.data.movies; // Assuming the response data is an array of movies
        console.log(moviesData)

        const moviesWithDetails = await Promise.all(
          moviesData.map(async (movie) => {
            const movieDetailsOptions = {
              method: 'GET',
              url: `https://movies-api14.p.rapidapi.com/movie/${movie._id}`,
              headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'movies-api14.p.rapidapi.com'
              }
            };

            try {
              const movieDetailsResponse = await axios.request(movieDetailsOptions);
              // console.log(movieDetailsResponse.data) // Log the response data for debugging purposes
              const [year, month, day] = movieDetailsResponse.data.movie.release_date.split('-');
              movieDetailsResponse.data.movie.release_date =`${day}/${month}/${year}`;
              // console.log(movieDetailsResponse.data.movie.release_date)
              return movieDetailsResponse.data.movie; // Assuming the response data is a movie object
            } catch (error) {
              console.error(error);
              return null; // Return null in case of an error
            }
          })
        );
          console.log(moviesWithDetails) // Log the moviesWithDetails array for debugging purpose
        setMovies(moviesWithDetails); // Update state with movies having details
        setFilteredMovies(moviesWithDetails);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData(); // Call the fetchData function immediately

  }, []);



  // handle the home button click
  const handleHome = () => {
    setFilteredMovies(movies);
  }


  // handle search modal  close and open
  const handleSearchModal = () => {
    setShowSearchModal(!showSearchModal);
  }


  // function to convert the date from dd/mm/yyyy to yyyy-mm-dd format
  const convertToDate = (dateString) => {
    const parts = dateString.split('/');
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // Reformatting to yyyy-mm-dd
    return new Date(formattedDate);
  };


  // handling the form to serach movies between two dates
  const handleSubmit = (e) => {
    e.preventDefault();
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
    const startDateValid = dateRegex.test(startDate);
    const endDateValid = dateRegex.test(endDate);
    if(!startDateValid || !endDateValid){
      alert("Please enter valid date")
      return;
    }
    console.log(startDateValid, startDate)
    console.log(endDateValid, endDate)
    // converting the date from dd/mm/yyyy to yyyy-mm-dd format
    const searchStartDate = (convertToDate(startDate));
    const searchEndDate = (convertToDate(endDate));
    // finding the required movies in range
    const moviesInRange = movies.filter((movie) => {
      const releaseDate = convertToDate(movie.release_date);
      return releaseDate >= searchStartDate && releaseDate <= searchEndDate;
    });

    setFilteredMovies(moviesInRange);
  }

      // Function to show modal and disable body scroll
    const handleModal = (card) => {
      setShowModal(true);
      console.log(card)
      // const url = 'https://www.youtube.com/watch?v=044PUmZQd1g';
      const urlParams = new URLSearchParams(new URL(card.youtube_trailer).search);
      const videoId = urlParams.get('v');
      console.log(card.youtube_trailer)
      card.youtube_trailer = `https://www.youtube.com/embed/${videoId}`;
      console.log(card.youtube_trailer)
      setModal(card);
      document.body.style.overflow = 'hidden';
    };


    // Function to close modal and enable body scroll
    const closeModal = () => {
      setShowModal(false);
      setModal(null);
      document.body.style.overflow = 'auto';
    };


    // searching for query form the modal submit 
    const handleSearchSubmit = async (e) => {
      e.preventDefault();
      const options = {
        method: 'GET',
        url: 'https://movies-api14.p.rapidapi.com/search',
        params: {query: searchTerm},
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'movies-api14.p.rapidapi.com'
        }
      };
      
      try {
        const response = await axios.request(options);
        // console.log(response.data.contents);
        // set the filtered movies and close the modal
        setFilteredMovies(response.data.contents);
        setShowSearchModal(false);
      } catch (error) {
        console.error(error);
      }
    }



  return (
    <div className="App">
      <section className="searchBarContainer">
      <div className='homeButton' onClick={()=>handleHome()}>Home</div>
        <form onSubmit={handleSubmit}>
          <label>From</label>
          <input type="text" required placeholder='DD/MM/YYYY'  value={startDate} onChange={(e)=>(setStartDate(e.target.value)) }  />
          <label> To</label>
          <input type="text" required placeholder='DD/MM/YYYY'  value={endDate} onChange={(e)=>(setEndDate(e.target.value))}  />
          <input type="submit" value="Submit" />
        </form>
        <div className='searchButton' onClick={()=>handleSearchModal()}>Search</div>
      </section>

      <section className="dataContainer">
        {filteredMovies &&
          filteredMovies.map((card, index) => {
            return (
              <div className='card' key={index} onClick={()=>handleModal(card)}>
                <img src={card.poster_path} />
                <div className='rating'>
                  <img className='posterImage' src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Gold_Star.svg/1200px-Gold_Star.svg.png'/>
                   {card.vote_average.toFixed(2)}
                   <img  src='https://icones.pro/wp-content/uploads/2021/02/icone-etoile-vide-bleu.png'/>
                  <span style={{color:"blue"}}>Rate</span>
                   </div>
                  
                <div className='title'>{card.title}</div>
                <div className='runtimeContainer'>
                  <span>{card.release_date}</span>
                  <span>{card.Runtime}</span>
                </div>
                <div className='dateContainer'> {card.release_date}</div>
              </div>
            )
          })
        }
      </section>

      {
        // modal to show a particular movie and play trailer
          (showModal) ? (
            <div className="modal" >
              <div className='closeModal' onClick={()=>closeModal()}> X </div>
              <div className="modalImage" >
                <img src={modal.backdrop_path} />
              </div>
              <section className='modalBody'>
                  <div className='title'>{modal.title}</div>
                  <iframe width="80%" height="70%"
                    src={modal.youtube_trailer}
                    frameborder="0" allowfullscreen="">
                  </iframe>
               
                  <div className='description'>{modal.overview}</div>
              </section>
             
            </div>
          ) : null
      }

      {
        // modal to show search input 
        (showSearchModal) ? (
          <section className='searchModalContainer'>
            <div className='searchModalInner'>
                  <div className='searchModal fadeInAnimation'> 
                  <div className='closeModal' onClick={()=>handleSearchModal()}> X </div>
                    <form className="form" onSubmit={(e)=>handleSearchSubmit(e)}>
                      <div className="form-group">
                        <label for="search">Enter Movie Name</label>
                        <input type="text" value={searchTerm} onChange={(e)=>(setSearchTerm(e.target.value))} placeholder="Enter your Movie Name" required />
                      </div>
                      <button className="form-submit-btn" type="submit">Search</button>
                    </form>
               </div>
            </div>
          
        </section>
       ) : null
      }
      
    </div>

    
  );
}

export default App;
