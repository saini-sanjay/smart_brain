import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
const app = new Clarifai.App({
 apiKey: 'bb1d331ae26c46a089a47a8d3c54a272'
});
const initialState={
      input:'',
      imageUrl:'',
      box:{},
      route:'signin',
      isSignedin:false,
      user:{
        id:'',
   name:'',
   email:'',
   password:'',
   entries:0,
   joined:''
      }
    }

const particlesOptions={
                particles: {
                  number:{ value:10000,
                
                    density: {
                      enable: true,
                      value_area:8000
                    }

                  }
                  style:{
                      width:100%
                    }
                }
              }
class App extends Component {
  constructor(){
    super();
    this.state=initialState;

  }
  loadUser=(data)=>{
    this.setState({user:{
   id:data.id,
   name:data.name,
   email:data.email,
   entries:data.entries,
   joined:data.joined
    }})
  }
  onRouteChange=(route)=>{
    if(route==='signout')
      {this.setState(initialState)
     }
     else if(route==='home')
     {this.setState({isSignedin:true})}
    // else
    this.setState({route:route});

  }
  /*componentDidMount(){
    fetch('http://localhost:3001')
    .then(response=>response.json())
    .then(console.log)
  }*/
  
  calculateFaceLocation=(data)=>{
    const clarifaiFace=data.outputs[0].data.regions[0].region_info.bounding_box
     const image=document.getElementById('inputimage');
     const width=Number(image.width);
     const height=Number(image.height);
     //console.log(width,height);
     return {
     leftCol:clarifaiFace.left_col*width,
     topRow:clarifaiFace.top_row*height,
     rightCol:width-(clarifaiFace.right_col*width),
     bottomRow:height-(clarifaiFace.bottom_row*height),
     }
  }
  displayFaceBox=(box)=>{
    this.setState({box:box});
  }
  onButtonSubmit =()=>{
   this.setState({imageUrl:this.state.input});
    app.models
    .predict(
     Clarifai.FACE_DETECT_MODEL, 
      this.state.input)
    .then(response=>{
      if(response){
        fetch('https://hello-sanjay.herokuapp.com/image',{
           method:'put',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        id:this.state.user.id
     
      })
        })
       .then(response=> response.json())
        .then(count=>{
          this.setState(Object.assign(this.state.user,{
            entries:count
          }))
        }).catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response))})
    .catch(err=> console.log(err)) ;
    
    
  }
   onInputChange=(event)=>{
    this.setState({input:event.target.value});
   //this.setState({imageUrl:this.state.input});
  }

 
  render() {
 
     const {isSignedin,imageUrl,route,box} =this.state;
         return (
      <div className="App">
      <Particles className='particles'
            param={particlesOptions}
            
            /> 

     <Navigation isSignedin={isSignedin} onRouteChange={this.onRouteChange} />
{ ( route==='home'
     ? <div>
      <Logo />
       <Rank name={this.state.user.name} entries={this.state.user.entries} />
      <ImageLinkForm
      onInputChange={this.onInputChange} 
      onButtonSubmit={this.onButtonSubmit}
       />
      <FaceRecognition box={box} imageUrl={imageUrl} />
      </div>
      :
      ( route==='signin'
      ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
       : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
    ))

     }
      </div>
    );
  }
}

export default App;
