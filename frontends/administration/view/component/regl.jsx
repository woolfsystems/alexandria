import React from 'react'

import CreateRegl from 'regl'
import angleNormals from 'angle-normals'
import mat4 from 'gl-mat4'

export default class Regl extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            ratio: props.ratio
        }
        this.el = React.createRef()
    }
    static getDerivedStateFromProps(props, state){
        return Object.assign(
            state,
            props
        )
    }
    bind(){
        let canvas = this.el.current
        const regl = CreateRegl({
            attributes: {
                antialias: true,
                alpha: true,
                depth: true
            },
            canvas: canvas,
            extensions: [
                'OES_standard_derivatives',
                'angle_instanced_arrays',
                // 'WEBGL_debug_renderer_info',
                // 'WEBGL_debug_shaders'
            ]
        })
    
        const fbo = regl.framebuffer({
            color: regl.texture({
                width: 1,
                height: 1,
                wrap: 'clamp'
            }),
            depth: true
        })
    
        var N = 10 // N triangles on the width, N triangles on the height.
    
        var angle = []
        for (var i = 0; i < N * N; i++) {
            // generate random initial angle.
            angle[i] = Math.random() * (2 * Math.PI)
        }
    
        // This buffer stores the angles of all
        // the instanced triangles.
        const angleBuffer = regl.buffer({
            length: angle.length * 4,
            type: 'float',
            usage: 'dynamic'
        })
    
        const draw = regl({
            frag: `
                precision mediump float;
    
                varying vec3 vColor;
                
                void main() {
                    gl_FragColor = vec4(vColor, 0.8);
                }`,
    
            vert: `
                precision mediump float;
    
                attribute vec2 p;
    
                attribute vec3 color, offset;
                attribute float angle;
    
                uniform mat4 view, projection, model;
                uniform vec2 resolution, mouse;
    
                varying vec3 vColor;
    
                void main() {
                    gl_Position = projection * view * model
                        * vec4(
                            p.x + offset.x,
                            p.y + offset.y,
                            offset.z,
                            1);
                    vColor = color;
                }`,
            attributes: {
                p: [[-0.05, -0.05], [0.1, -0.05], [0.1, 0.05], [-0.05, 0.05]],
    
                offset: {
                    buffer: regl.buffer(
                        Array(N * N).fill().map((_, i) => {
                            var x = -1 + 2 * Math.floor(i / N) / N + 0.1
                            var y = -1 + 2 * (i % N) / N + 0.1
                            var z = ((Math.random() * 50) -25) * 0.04
                        return [x, y, z]
                        })),
                    divisor: 1 // one separate offset for every triangle.
                },
                
    
                color: {
                    buffer: regl.buffer(
                        Array(N * N).fill().map((_, i) => {
                            var r = Math.floor(i / N) / N
                            var g = (i % N) / N
                        return [r, g, r * g + 0.2]
                        })),
                    divisor: 1 // one separate color for every triangle
                },
    
                angle: {
                    buffer: angleBuffer,
                    divisor: 1 // one separate angle for every triangle
                }
            },
    
            depth: {
                enable: false
            },
            cull: {
                enable: false
            },
            blend: {
                enable: true,
                //func: { srcRGB: 'src alpha', dstRGB: 'one minus src alpha', srcAlpha: 1, dstAlpha: 'one minus src alpha' }, //1
                // func: {src: 1, dst: 'one minus src alpha'}, //2
                func: { src: 'src alpha', dst: 'one minus src alpha' },
                //func: { srcRGB: 'dst color', dstRGB: 0, srcAlpha: 1, dstAlpha: 1 },
                // func: {src: 'one minus dst alpha', dst: 'src color'}, //never got this working correctly with opacities, but it does look like a multiply blend
                //func: {src: 'dst color', dst: 'one minus src alpha'}, //seems to work for Pixi, but I just get a white screen...
                equation: { rgb: 'add', alpha: 'add' },
            },
    
            count: 4,
            instances: N * N,
            primitive: 'line loop'
        })
        const drawFbo = regl({
            vert: `
                precision mediump float;
                attribute vec2 position;
                varying vec2 uv;
                void main () {
                    uv = position;
                    gl_Position = vec4(2.0 * position - 1.0, 0.0, 1.0);
                }
            `,
            frag: `
                precision mediump float;
                uniform sampler2D tex;
                uniform float t;
                varying vec2 uv;
                void main () {
                    gl_FragColor = vec4(texture2D(tex, uv).rgb, 0.9);
                }
    
            `,
            attributes: {
              position: [ -4, -4, 4, -4, 0, 4 ]
            },
            uniforms: {
              tex: ({count}) => fbo
            },
            depth: { enable: false },
            count: 3
        })
    
        const setupDefault = regl({
            cull: {
              enable: false
            },
            uniforms: {
                resolution: regl.prop('resolution'),
                mouse: regl.prop('mouse'),
                tick: ({tick}) =>
                    tick % 100,
                model: mat4.identity([]),
                view: ({tick, viewportHeight}) => {
                    let vpos = ((mousePosition[1]/viewportHeight) * 100)
                    const t = Math.abs(vpos*0.03)
                    return mat4.lookAt([],
                        [0, 1 * Math.cos(t), 1 * Math.sin(t)],
                        [0, 0, 0],
                        [0, 1, 0])
                },
                projection: ({viewportWidth, viewportHeight}) =>
                    mat4.ortho([], -1, 1, -1, 1, -4, 4)
            },
            framebuffer: fbo
        })
    
        let mousePosition = [0, 0]
        canvas.addEventListener('mousemove', ({ clientX, clientY }) =>
            mousePosition = [clientX, clientY])
        fbo.resize(canvas.width, canvas.height)
    
        regl.frame(({deltaTime, viewportWidth, viewportHeight}) => {
            fbo.resize(viewportWidth, viewportHeight)
            for (var i = 0; i < N * N; i++) {
                angle[i] += 0.01
            }
            angleBuffer.subdata(angle)
            setupDefault({
                mouse: mousePosition,
                resolution: [
                    viewportWidth,
                    viewportHeight
                ] 
            }, () => {
                regl.clear({
                    color: [0, 0, 0, 1],
                    depth: 1
                })
                draw()
            })
            drawFbo()
        })
        this.resize() && window.addEventListener('resize', this.resize.bind(this))
    }
    onSize(){
        console.log('SIZE')
    }
    resize(){
        let _p = this.el.current
        try{
            let { width, height } = _p.parentElement.getBoundingClientRect()
            _p.width = Math.ceil(width)
            _p.height = Math.ceil(_p.width * window.devicePixelRatio * (1/this.state.ratio))
        } catch {
            return false
        }
        return true
    }
    show(){
        this.el.current.animate([
            {opacity: 0},
            {opacity: 1}
        ], {
            duration: 500
        }).onfinish = (_e) =>
            this.el.current.style.opacity = 1
    }
    hide(){
        this.el.current.animate([
            {opacity: 1},
            {opacity: 0}
        ], {
            duration: 500
        }).onfinish = (_e) =>
            this.el.current.style.opacity = 0
    }
	componentDidMount() {
        this.bind()
        this.show()
    }
    // render(){
    //     return (<React.Fragment>
    //         <canvas ref={this.el} style={{opacity: 0}}></canvas>
    //     </React.Fragment>)
    // }
}