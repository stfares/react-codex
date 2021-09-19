import React, { Component } from 'react';
import Prism from "prismjs";
import Frame from './Frame';

// Custom component
import { Listening } from './Listening';

// svg and images
import {ReactComponent as MicrophoneLogo} from './microphone.svg';

// CSS import
import './App.css';
import "./prism.css";

class App extends Component {
  state = {
    query: '',
    isListening: false,
    promptArr: [],
    showCode: false,
    deleteIndex: undefined
  }

  speech = new window.webkitSpeechRecognition();

  componentDidMount() {
    this.speech.continuous = true;
    this.speech.interimResults = true;
    setTimeout(() => Prism.highlightAll(), 0)
  }

  componentDidUpdate() {
    setTimeout(() => Prism.highlightAll(), 0)
  }
  
  handleTextAreaChange = ({target}) => {
    this.setState({
      query: target.value
    })
  }

  handleTextAreaKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      this.handleSubmit()
    }
  }

  handleSubmit = async () => {
    await this.clickChild()
    this.setState({
      query: ''
    })
  }

  handleMicrophone = () => {
    this.setState({
      isListening: !this.state.isListening
    })
    if (this.state.isListening) {
      this.speech.stop()
    } else {
      this.speech.start()
    }

    this.speech.onresult = (event) => {
      this.setState({
        query: event.results[event.results.length - 1][0].transcript
      })
    }

    this.speech.onend = (event) => {
      this.setState({
        isListening: false
      })
    }
  }

  handleCode = (promptArr) => {
    this.setState({
      promptArr
    })
  }

  handleShowCode = (showCode) => {
    this.setState({
      showCode
    })
  }

  handleDelete = (e, index) => {
    this.setState({
      deleteIndex: index
    }, async () => {
      await this.clickChild()
      this.setState({
        deleteIndex: undefined
      })
    })
    
  }

  render () {
    return (
      <div className="App">
        {/* Left Panel */}
        <section className='left-panel'>
          <Frame
            query={this.state.query}
            deleteIndex={this.state.deleteIndex}
            handleShowCode={this.handleShowCode}
            code={this.handleCode}
            setClick={click => this.clickChild = click} />
          {this.state.isListening && <Listening />}

          <div className='query-container'>
            <textarea className='query-box' onChange={this.handleTextAreaChange} onKeyDown={this.handleTextAreaKeyDown}  value={this.state.query} placeholder='Provide Instructions...'></textarea>
            <div className='microphone-wrapper' tabIndex="0" onClick={this.handleMicrophone}>
              <MicrophoneLogo />
            </div>
            <div className="submit-button" tabIndex="0" onClick={this.handleSubmit}>
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <section className='right-panel'>
          {this.state.showCode && this.state.promptArr.length > 0 && this.state.promptArr.map((item, index) => {
            return (
              <div key={index} className='code-block'>
                <div className="modify-container">
                  <div className="delete" tabIndex='0' onClick={(e) => this.handleDelete(e, index)}>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                <pre className='line-numbers language-js'>
                  <code className="language-js code-script">{item}</code>
                </pre>
              </div>
            )
          })
          }
        </section>

      </div>
  )};
}

export default App;
