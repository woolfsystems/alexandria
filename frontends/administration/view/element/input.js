
class ViewInput extends HTMLElement {
  addValidMessage() {
        this.shadow = this.attachShadow({mode: 'open'})
        this.wrapper = document.createElement('span')
        this.wrapper.setAttribute('class', 'wrapper')


        this.info = document.createElement('input');
        ['type', 'placeholder', 'value', 'min', 'max', 'pattern', 'required'].map(_k => {
            if(this.hasAttribute(_k))
                this.info.setAttribute(_k, this.getAttribute(_k))
        })
        
        this.info.addEventListener('change', _e =>
            this.updateValidity(_e))
        
        let img = document.createElement('img')
        img.src = this.hasAttribute('img')
            ? this.getAttribute('img')
            : 'img/default.png'
        
        this.msg = document.createElement('span')
        this.msg.setAttribute('class', 'msg hole')

        this.icon = document.createElement('span')
        this.icon.setAttribute('class', 'icon hole')
        this.icon.setAttribute('tabindex', 0)
        this.icon.appendChild(img)

        this._style = document.createElement('style')
        
        this._style.textContent = `
            .wrapper {
                position: relative;
            }
            .wrapper .hole{
                pointer-events: none;
            }
            .wrapper > .icon {
                position: absolute;
                right: 0;
                display: none;
            }
            .wrapper > .msg {
                color: red;
                font-size: 0.5em;
                position: absolute;
                right: 0;
                bottom: -1.6em !important;
                text-transform: lowercase;
            }
            .wrapper > input {
                width: 100%;
                padding: 0.4em 0;
                border: none;
                border-bottom: 1px solid black;
                background-color: transparent;
            }
            .wrapper > input:invalid {
                color: red;
                box-shadow: none;
                border-bottom: 1px solid red;
            }
        `

        this.shadow.appendChild(this._style)
        this.shadow.appendChild(this.wrapper)
        this.wrapper.appendChild(this.info)
        this.wrapper.appendChild(this.icon)
        
        if(this.info.hasAttribute('value'))
            this.updateValidity()
        this.wrapper.appendChild(this.msg)
    }

  constructor() {
    super()

    this.addEventListener('click', e => {
      if (this.disabled) {
        return
      }
      this.toggle()
    })
    setImmediate(()=>{
        this.addValidMessage()
    })
  }

  toggle() {
    console.log('toggle')
  }
  updateValidity(_e){
    this.setAttribute('defaultValue', this.info.value)
    this.msg.textContent = this.info.validationMessage
  }
}


customElements.define('view-input', ViewInput)
