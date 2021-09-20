import React, { Component } from 'react';
import axios from 'axios';
import { Loading } from './Loading';

class Frame extends Component {
  state = {
    result: [],
    loading: false,
    showCode: false
  }

  generatedFrame = React.createRef()
  promptArr = []

  componentDidMount() {
    this.props.setClick(this.getCode)
    this.createFrame()
    this.handleClear()

    /* Mock data for testing */
    // const mockArr = []
    // const mockJson = `/* Command: create 3*3 2-d array having blue borders */\nvar table = document.createElement('table');\ntable.style.border = '1px solid blue';\nfor (var i = 0; i < 3; i++) {\n  var row = document.createElement('tr');\n  for (var j = 0; j < 3; j++) {\n    var cell = document.createElement('td');\n    cell.style.border = '1px solid blue';\n    row.appendChild(cell);\n  }\n  table.appendChild(row);\n}\ndocument.body.appendChild(table);\n\n`
    // const mockJson2 = `/* Command: print hello world */\nvar helloWorld = document.createElement('div');\nhelloWorld.innerHTML = 'Hello World';\ndocument.body.appendChild(helloWorld);`
    // mockArr.push(mockJson)
    // mockArr.push(mockJson2)
    // this.promptArr = mockArr
    // this.updateFrame(mockJson)
    // this.props.code(mockArr)
  }

  getCode = () => {
    return new Promise(resolve => {
      if (this.props.editComplete) {
        const script = this.props.getUpdatedScript()
        this.updateFrame(script)
      }
      if (typeof this.props.deleteIndex !== 'undefined') {
        const index = this.props.deleteIndex
        this.promptArr.splice(index, 1)
        const script = this.promptArr.join('')
        this.updateFrame(script)
        this.props.code(this.promptArr)
        axios({
          url: 'http://localhost:5000/remove',
          method: 'post',
          headers: {
            'content-Type': 'application/json'
          },
          data: {index}
        }).then((result) => {
          console.log(result)
          resolve('resolved')
        }).catch((err) => {
          resolve('rejected')
          console.log(err)
        })
      }

      if (this.props.query) {
        this.setState({
          loading: true
        })

        axios({
          url: 'http://localhost:5000/code',
          method: 'post',
          headers: {
            'content-Type': 'application/json'
          },
          data: {query: this.props.query}
        }).then((result) => {
          let promptArr = result.data
          promptArr.shift()
          this.promptArr = promptArr
          const script = promptArr.join('')
          this.updateFrame(script)
          this.props.code(promptArr)
          this.setState({
            loading: false
          })
          resolve('resolved')
        }).catch(() => {
          this.setState({
            loading: false
          })
          resolve('rejected')
        })
        
        /* Mock axios call for promise */
        // setTimeout(() => {
        //   this.setState({
        //     loading: false
        //   })
        //   resolve('resolved')
        // }, 3000);
  
      }
    })

  }

  updateFrame = (script) => {
    const iframe = document.getElementsByTagName('iframe')[0];
    const html = `<body><script>${script}</script></body>`;
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(html);
    iframe.contentWindow.document.close();
  }

  createFrame = () => {
    const iframe = document.createElement('iframe');
    const container = document.getElementById('frameContainer')
    container.appendChild(iframe);
    iframe.style['border'] = 'none'
    iframe.setAttribute('height', '100%')
    iframe.setAttribute('width', '100%')
  }

  handleClear = () => {
    this.script = ''
    this.updateFrame('')
    this.props.code([])
    axios({
      url: 'http://localhost:5000/clear',
      method: 'get',
      headers: {
        'content-Type': 'application/json'
      }
    }).then((result) => {
      console.log('cleared');
    }).catch(() => {
      console.log('error while clearing');
    })
  }

  handleCheckboxChange = () => {
    this.props.handleShowCode(!this.state.showCode)
    this.setState({
      showCode: !this.state.showCode
    })
  }

  handleSubmit = () => {

  }
  render() {
    const textArea = `
    <html>
      <head>
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            ${this.promptArr.join('')}
          });
        </script>
      </head>
      <body style="margin: 0;"></body>
    </html>
    `
    return (
      <>
        <div className='header-buttons'>
          <label className='show-code-checkbox' style={{padding: '20px 0 0 32px'}}>
            Show code: <input type='checkbox' value={this.state.showCode} onChange={this.handleCheckboxChange} />
          </label>
          <button className='clear-button' onClick={this.handleClear}>Clear All</button>
          <div className="jsfiddle-form">
            <form action="https://jsfiddle.net/api/post/library/pure" method="post" target='check'>
              <textarea name="html" value={textArea} readOnly></textarea>
              <button className="export" type='submit' onClick={this.handleSubmit}>Export to JSFiddle</button>
            </form>
          </div>
        </div>
        <div id="frameContainer" className='iframe-container'></div>
        {this.state.loading && <Loading />}
      </>
    );
  }
}

export default Frame;