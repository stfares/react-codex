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
    promptUpdatedArr: [],
    showCode: false,
    deleteIndex: undefined,
    temp: '',
    editComplete: false
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
    const promptUpdatedArr = promptArr.map((item, index) => {
      return {
        index,
        value: item,
        edit: false
      }
    })
    this.setState({
      promptUpdatedArr
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

  handleEditChange = (index, status) => {
    const copy = JSON.parse(JSON.stringify(this.state.promptUpdatedArr))
    const objIndex = copy.findIndex((obj) => obj.index === index)
    copy[objIndex].edit = status
    this.setState({
      promptUpdatedArr: copy
    })
  }

  handleEdit = (e, index) => {
    this.handleEditChange(index, true)
  }


  handleValid = (e, index) => {
    const copy = JSON.parse(JSON.stringify(this.state.promptUpdatedArr))
    const objIndex = copy.findIndex((obj) => obj.index === index)
    copy[objIndex].value = this.state.temp
    copy[objIndex].edit = false
    
    this.setState({
      promptUpdatedArr: copy,
      temp: '',
      editComplete: true
    }, async () => {
      await this.clickChild()
      this.setState({
        editComplete: false
      })
    })
  }

  handleCancel = (e, index) => {
    this.handleEditChange(index, false)
  }

  handleInput = (e) => {
    this.setState({
      temp: e.target.innerText
    })
  }

  getUpdatedScript = () => {
    let script = ''
    this.state.promptUpdatedArr.forEach((item) => script = script + item.value)
    return script
  }
  

  render () {
    
    return (
      <div className="App">
        {/* Left Panel */}
        <section className='left-panel'>
          <Frame
            query={this.state.query}
            deleteIndex={this.state.deleteIndex}
            editComplete={this.state.editComplete}
            getUpdatedScript={this.getUpdatedScript}
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
          {this.state.showCode && this.state.promptUpdatedArr.length > 0 && this.state.promptUpdatedArr.map((item, index) => {
            return (
              <div key={item.index} className='code-block'>
                <div className="modify-container">
                  {!item.edit
                    ? <>
                        <div className="edit" tabIndex='0' onClick={(e) => this.handleEdit(e, item.index)}>
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                          </svg>
                        </div>
                        <div className="delete" tabIndex='0' onClick={(e) => this.handleDelete(e, item.index)}>
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                      </>
                    : <>
                        <div className="valid" tabIndex='0' onClick={(e) => this.handleValid(e, item.index)}>
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <div className="cancel" tabIndex='0' onClick={(e) => this.handleCancel(e, item.index)}>
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                    </>
                  }
                </div>
                {item.edit
                  ? <div className='editable-code'>
                      <div id={`editable-{index}`} onInput={(e) => this.handleInput(e, item.index)} contentEditable suppressContentEditableWarning={true} spellCheck={false}>{item.value}</div>
                    </div>
                  : <pre className='line-numbers language-js'>
                      <code className="language-js">{item.value}</code>
                    </pre>
                }
              </div>
            )
          })
          }
        </section>

      </div>
  )};
}

export default App;
