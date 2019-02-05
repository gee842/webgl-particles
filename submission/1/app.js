var Particle = function(x,y,z,c){
  this.x = x;
  this.y = y;
  this.z = z;
  this.v = [0.0,0.0,0.0];
  this.c = c;
}
var particleList = [];
particleList.push( new Particle(-1.5,1.0,-1.0,[0.5,0.5,0.5]));



function randomInitParticles(number,min,max)
{
  console.log(number,min,max)

  outs = [];

  for (var i = 0; i < number; i++) {
    x = Math.random() * (max - min) + min;
    y = Math.random() * (max - min) + min;
    z = Math.random() * (max - min) + min;
    cr = Math.random()
    cg = Math.random()
    cb = Math.random()

    outs.push(new Particle(x,y,z,[cr,cg,cb]));
  }

  return outs;
}

// particleList.push( new Particle(-1.5,1.0,-1.0,[0.5,0.5,0.5]));
// particleList.push( new Particle(-1.0,1.0,-1.0,[0.5,0.5,0.5]));
// particleList.push( new Particle(1.0,1.0,-1.0,[0.5,0.5,0.5]));


function updateParticles(particles)
{
  if (!particles) return;
  for (var i = 0; i < particles.length; i++) {
    particles[i].x += particles[i].v[0];
    particles[i].y += particles[i].v[1];
    particles[i].z += particles[i].v[2];
  }
}

function giveVertexBuffer(particles)
{
  if (!particles) return [];
  var outp = [];
  var els = [];
  for (var i = 0; i < particles.length; i++) {
    outp.push(particles[i].x);
    outp.push(particles[i].y);
    outp.push(particles[i].z);
    outp.push(particles[i].c[0]);
    outp.push(particles[i].c[1]);
    outp.push(particles[i].c[2]);


  }
  return outp;
}

function reverseVelocities(particles)
{
  for (var i = 0; i < particles.length; i++) {

    particles[i].v[0] = 0 - particles[i].v[0];
    particles[i].v[1] = 0 - particles[i].v[1]
    particles[i].v[2] = 0 - particles[i].v[2]
  }
}

function giveParticleOrder(particles)
{
  if (!particles) return [];
  var out = [];
  for (var i = 0; i < particles.length; i++) {
    out.push(i);
  }
  return out;
}

function setVelocity(particle,vel)
{
  particle.v = vel;
}
function randomVelocities(particles,min,max)
{
  for (var i = 0; i < particles.length; i++) {

    particles[i].v[0] = Math.random() * (max - min) + min;
    particles[i].v[1] = Math.random() * (max - min) + min;
    particles[i].v[2] = Math.random() * (max - min) + min;
  }
}



var vertexShaderText =
[
  'precision mediump float;',
  '',
  'attribute vec3 vertPosition;',
  'attribute vec3 vertColor;',
  'varying vec3 fragColor;',
  'uniform mat4 mWorld;',
  'uniform mat4 mView;',
  'uniform mat4 mProj;',
  '',
  'void main()',
  '{',
  'fragColor=vertColor;',
  'gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
  'gl_PointSize = 7.0;',
  '}'
].join('\n');

var fragmentShaderText =
[
  'precision mediump float;',
  '',
  'varying vec3 fragColor;',
  '',
  'void main()',
  '{',
  'gl_FragColor=vec4(fragColor,1.0);',
  '}'
].join("\n");


var InitDemo = function(){



  var canvas = document.querySelector('#glCanvas');
  var gl = canvas.getContext('webgl');
  if (!gl)
  {
    gl = canvas.getContext('experimental-webgl');
  }


  gl.clearColor(0.5,0.7,0.8,1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertexShader,vertexShaderText);
  gl.shaderSource(fragmentShader,fragmentShaderText);

  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  if(!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)){
    console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
    return;
  }
  if(!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)){
    console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
    return;
  }

  //creates a program:

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
    console.error('ERROR compiling program!', gl.getProgramInfoLog(program));
    return;
  }

  var boxVertices = giveVertexBuffer(particleList);

  // var boxVertices =
	// [ // X, Y, Z           R, G, B
	// 	// Top
	// 	-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
	// 	-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
	// 	1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
	// ];

	var boxIndices =giveParticleOrder(particleList);

	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

  var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
  gl.vertexAttribPointer(
    positionAttribLocation, //attribute location
    3,//number of elements per attribute
    gl.FLOAT,//type of elements
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT, //number of bytes 4*2
    //size of an indiviudal vertexShader
    0//offset from beginning of a single vertex to this attribute
  )
  gl.vertexAttribPointer(
    colorAttribLocation, //attribute location
    3,//number of elements per attribute
    gl.FLOAT,//type of elements
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT, //number of bytes 4*2
    //size of an indiviudal vertexShader
    3 * Float32Array.BYTES_PER_ELEMENT//offset from beginning of a single vertex to this attribute
  )

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);
  gl.useProgram(program);

  var matWorldUniformLocation = gl.getUniformLocation(program,'mWorld');
  var matViewUniformLocation = gl.getUniformLocation(program,'mView');
  var matProjUniformLocation = gl.getUniformLocation(program,'mProj');

  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix,[0,0,-8],[0,0,0],[0,1,0]);
  mat4.perspective(projMatrix,glMatrix.toRadian(45),canvas.width/canvas.height, 0.1, 1000.0);

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

  //MAIN RENDER LOOP
  var identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  var angle = 0;
  var loop = function(){
    angle = performance.now() / 1000 / 6 * 2 * Math.PI;
    mat4.rotate(worldMatrix, identityMatrix, angle, [0,1,0]);
    //mat4.rotate(worldMatrix, identityMatrix, angle*0.7, [-4,0,3]);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.clearColor(0.75,0.85,0.8,1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);


    //UPDATE PARTICLE POSITION HERE
    updateParticles(particleList);
    boxVertices = giveVertexBuffer(particleList);
    boxIndices = giveParticleOrder(particleList);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    gl.drawElements(gl.LINE_LOOP, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);





};
