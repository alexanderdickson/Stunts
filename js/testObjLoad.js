window.onload = function() {

var container, stats;

var CENTER;
var camera, scene, renderer, controls;

var rotY, mouseY, mouseZ;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var trackObjs = {};

var deg2rad = Math.PI / 180;
var ROT_90  = 90  * deg2rad;
var ROT_180 = 180 * deg2rad;
var ROT_270 = 270 * deg2rad;

var Y_RATIO = 0.87890625;
var HTILE_SIZE = 5.12;
var TILE_SIZE = HTILE_SIZE*2;

var clock = new THREE.Clock();

init();
animate();

function addTrackObj(trackObj, x, z, transX, transY, transZ, rotY) {
	if (!trackObj) return;

	var newObj = trackObjs[trackObj].clone();
	newObj.position.set(x * TILE_SIZE + transX, transY + 0.05, -z * TILE_SIZE + transZ);
	newObj.rotation.y = rotY;
	scene.add(newObj);
}

function loadTrack(track, horizon, terrain) {
	for (var z = 0; z < 30; z++) {
		for (var x = 0; x < 30; x++) {
			var terrObj = null, terrObj2 = null, trackObj = null, trackObj2 = null;
			var transX = 0, transY = 0, transZ = 0;
			var rotX = 0, rotY = 0, rotZ = 0;
			var invertSecondObj = false;
			switch (terrain[z][x]) {
				case 0x00:
					terrObj = "terr";
					break;
				case 0x06:
					terrObj = "high";
					transY = HTILE_SIZE * Y_RATIO;
					break;

				case 0x07:
					terrObj = "goup";
					rotZ = -1;
					rotY = ROT_180;
					break;
				case 0x08:
					terrObj = "goup";
					rotZ = 1;
					rotY = ROT_270;
					break;
				case 0x09:
					terrObj = "goup";
					rotZ = 1;
					rotY = 0;
					break;
				case 0x0A:
					terrObj = "goup";
					rotZ = -1;
					rotY = ROT_90;
					break;

				case 0x0B:
					terrObj = "gouo";
					terrObj2 = "terr";
					rotY = ROT_270;
					break;
				case 0x0C:
					terrObj = "gouo";
					terrObj2 = "terr";
					rotY = 0;
					break;
				case 0x0D:
					terrObj = "gouo";
					terrObj2 = "terr";
					rotY = ROT_90;
					break;
				case 0x0E:
					terrObj = "gouo";
					terrObj2 = "terr";
					rotY = ROT_180;
					break;

				case 0x0F:
					terrObj = "goui";
					rotY = ROT_270;
					break;
				case 0x10:
					terrObj = "goui";
					rotY = 0;
					break;
				case 0x11:
					terrObj = "goui";
					rotY = ROT_90;
					break;
				case 0x12:
					terrObj = "goui";
					rotY = ROT_180;
					break;
			}
			switch (track[z][x]) {
				case 0x01:
					trackObj = "fini";
					trackObj2 = "road";
					rotY = 0;
					break;
				case 0xB5:
					trackObj = "fini";
					trackObj2 = "road";
					rotY = ROT_90;
					break;
				case 0xB3:
					trackObj = "fini";
					trackObj2 = "road";
					rotY = ROT_180;
					break;
				case 0xB4:
					trackObj = "fini";
					trackObj2 = "road";
					rotY = ROT_270;
					break;

				case 0x04:
					if (rotZ != 0) {
						trackObj = "rdup";
						terrObj = null;
					} else {
						trackObj = "road";
					}
					rotY = rotZ > 0 ? 0 : ROT_180;
					break;
				case 0x05:
					if (rotZ != 0) {
						trackObj = "rdup";
						terrObj = null;
					} else {
						trackObj = "road";
					}
					rotY = rotZ > 0 ? ROT_270 : ROT_90;
					break;

				case 0x0A:  // FIXME: Check also fillers
					trackObj = "stur";
					rotY = ROT_180;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x0B:  // FIXME: Check also fillers
					trackObj = "stur";
					rotY = ROT_90;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x0C:  // FIXME: Check also fillers
					trackObj = "stur";
					rotY = ROT_270;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x0D:  // FIXME: Check also fillers
					trackObj = "stur";
					rotY = 0;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;

				case 0x24:
					trackObj = "ramp";
					rotY = ROT_90;
					break;
				case 0x25:
					trackObj = "ramp";
					rotY = ROT_270;
					break;
				case 0x26:
					trackObj = "ramp";
					rotY = ROT_180;
					break;
				case 0x27:
					trackObj = "ramp";
					rotY = 0;
					break;

				case 0x28:
					trackObj = "lban";
					rotY = ROT_180;
					break;
				case 0x29:
					trackObj = "lban";
					rotY = ROT_270;
					break;
				case 0x2A:
					trackObj = "lban";
					rotY = 0;
					break;
				case 0x2B:
					trackObj = "lban";
					rotY = ROT_90;
					break;

				case 0x2C:
					trackObj = "rban";
					rotY = 0;
					break;
				case 0x2D:
					trackObj = "rban";
					rotY = ROT_270;
					break;
				case 0x2E:
					trackObj = "rban";
					rotY = 0;
					break;
				case 0x2F:
					trackObj = "rban";
					rotY = ROT_270;
					break;

				case 0x30:
					trackObj = "bank";
					rotY = 0;
					break;
				case 0x31:
					trackObj = "bank";
					rotY = 0;
					break;
				case 0x32:
					trackObj = "bank";
					rotY = ROT_90;
					break;
				case 0x33:
					trackObj = "bank";
					rotY = 0;
					break;


				case 0x34:  // FIXME: Check also fillers
					trackObj = "btur";
					rotY = ROT_180;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x35:  // FIXME: Check also fillers
					trackObj = "btur";
					rotY = ROT_90;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x36:  // FIXME: Check also fillers
					trackObj = "btur";
					rotY = ROT_270;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x37:  // FIXME: Check also fillers
					trackObj = "btur";
					rotY = 0;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;

				case 0x38:
					trackObj = "brid";
					rotY = ROT_90;
					break;
				case 0x39:
					trackObj = "brid";
					rotY = ROT_270;
					break;
				case 0x3A:
					trackObj = "brid";
					rotY = 0;
					break;
				case 0x3B:
					trackObj = "brid";
					rotY = ROT_180;
					break;

				case 0x3C:  // FIXME: Check also fillers
					trackObj = "chi2";
					rotY = ROT_180;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x3D:  // FIXME: Check also fillers
					trackObj = "chi2";
					rotY = ROT_270;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x3E:  // FIXME: Check also fillers
					trackObj = "chi1";
					rotY = ROT_270;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x3F:  // FIXME: Check also fillers
					trackObj = "chi1";
					rotY = 0;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;

				case 0x40:  // FIXME: Check also fillers
					trackObj = "loop";
					trackObj2 = "loo1";
					rotY = 0;
					transX = 0;
					transZ = HTILE_SIZE;
					break;
				case 0x41:  // FIXME: Check also fillers
					trackObj = "loop";
					trackObj2 = "loo1";
					rotY = ROT_90;
					transX = 0;
					transZ = HTILE_SIZE;
					break;

				case 0x44:
					trackObj = "pipe";
					trackObj2 = "pip2";
					rotY = 0;
					break;
				case 0x45:
					trackObj = "pipe";
					trackObj2 = "pip2";
					rotY = ROT_90;
					break;

				case 0x46:
					trackObj = "spip";
					rotY = ROT_180;
					break;
				case 0x47:
					trackObj = "spip";
					rotY = 0;
					break;
				case 0x48:
					trackObj = "spip";
					rotY = ROT_90;
					break;
				case 0x49:
					trackObj = "spip";
					rotY = ROT_270;
					break;

				case 0x53:
					trackObj = "hpip";
					trackObj2 = "pip2";
					rotY = 0;
					break;
				case 0x54:
					trackObj = "hpip";
					trackObj2 = "pip2";
					rotY = ROT_90;
					break;

				case 0x55:  // FIXME: Check also fillers
					trackObj = "vcor";
					rotY = 0;
					transX = HTILE_SIZE;
					transZ = 0;
					break;
				case 0x56:  // FIXME: Check also fillers
					trackObj = "vcor";
					rotY = ROT_90;
					transX = HTILE_SIZE;
					transZ = 0;
					break;

				case 0x57:  // FIXME: Check also fillers
					trackObj = "sofr";
					rotY = ROT_180;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x58:  // FIXME: Check also fillers
					trackObj = "sofr";
					rotY = 0;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x59:  // FIXME: Check also fillers
					trackObj = "sofr";
					rotY = 0;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x5A:  // FIXME: Check also fillers
					trackObj = "sofr";
					rotY = 0;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;

				case 0x5B:  // FIXME: Check also fillers
					trackObj = "sofl";
					rotY = ROT_180;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x5C:  // FIXME: Check also fillers
					trackObj = "sofl";
					rotY = 0;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x5D:  // FIXME: Check also fillers
					trackObj = "sofl";
					rotY = 0;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;
				case 0x5E:  // FIXME: Check also fillers
					trackObj = "sofl";
					rotY = 0;
					transX = HTILE_SIZE;
					transZ = HTILE_SIZE;
					break;

				case 0x5F:
					trackObj = "sram";
					rotY = ROT_90;
					break;
				case 0x60:
					trackObj = "sram";
					rotY = ROT_270;
					break;
				case 0x61:
					trackObj = "sram";
					rotY = ROT_180;
					break;
				case 0x62:
					trackObj = "sram";
					rotY = 0;
					break;

				case 0x63:
					trackObj = "selr";
					rotY = 0;
					break;
				case 0x64:
					trackObj = "selr";
					rotY = ROT_90;
					break;

				case 0x65:
					trackObj = "elsp";
					trackObj2 = "road";
					rotY = 0;
					invertSecondObj = true;     // HACK!
					break;
				case 0x66:
					trackObj = "elsp";
					trackObj2 = "road";
					rotY = ROT_90;
					invertSecondObj = true;     // HACK!
					break;

				case 0x67:
					trackObj = "elsp";
					rotY = 0;
					break;
				case 0x68:
					trackObj = "elsp";
					rotY = ROT_90;
					break;

				case 0x6D:
					trackObj = "wroa";
					rotY = 0;
					break;
				case 0x6E:
					trackObj = "wroa";
					rotY = ROT_90;
					break;

				case 0x6F:
					trackObj = "gwro";
					rotY = ROT_180;
					break;
				case 0x70:
					trackObj = "gwro";
					rotY = ROT_270;
					break;
				case 0x71:
					trackObj = "gwro";
					rotY = 0;
					break;
				case 0x72:
					trackObj = "gwro";
					rotY = 0;
					break;

				case 0x73:
					trackObj = "barr";
					trackObj2 = "road";
					rotY = 0;
					break;
				case 0x74:
					trackObj = "barr";
					trackObj2 = "road";
					rotY = ROT_90;
					break;

				case 0x97:
					trackObj = "palm";
					rotY = 0;
					break;
				case 0x98:
					trackObj = "cact";
					rotY = 0;
					break;
				case 0x99:
					trackObj = "tree";
					rotY = 0;
					break;
				case 0x9A:
					trackObj = "tenn";
					rotY = 0;
					break;

				case 0x9B:
					trackObj = "gass";
					rotY = ROT_180;
					break;
				case 0x9C:
					trackObj = "gass";
					rotY = 0;
					break;
				case 0x9D:
					trackObj = "gass";
					rotY = ROT_270;
					break;
				case 0x9E:
					trackObj = "gass";
					rotY = ROT_90;
					break;

				case 0x9F:
					trackObj = "barn";
					rotY = 0;
					break;
				case 0xA0:
					trackObj = "barn";
					rotY = ROT_180;
					break;
				case 0xA1:
					trackObj = "barn";
					rotY = ROT_270;
					break;
				case 0xA2:
					trackObj = "barn";
					rotY = ROT_90;
					break;

				case 0xA3:
					trackObj = "offi";
					rotY = 0;
					break;
				case 0xA4:
					trackObj = "offi";
					rotY = ROT_180;
					break;
				case 0xA5:
					trackObj = "offi";
					rotY = ROT_270;
					break;
				case 0xA6:
					trackObj = "offi";
					rotY = ROT_90;
					break;

				case 0xAB:
					trackObj = "boat";
					rotY = 0;
					break;
				case 0xAC:
					trackObj = "boat";
					rotY = ROT_180;
					break;
				case 0xAD:
					trackObj = "boat";
					rotY = ROT_270;
					break;
				case 0xAE:
					trackObj = "boat";
					rotY = ROT_90;
					break;

				case 0xAF:
					trackObj = "rest";
					rotY = 0;
					break;
				case 0xB0:
					trackObj = "rest";
					rotY = ROT_180;
					break;
				case 0xB1:
					trackObj = "rest";
					rotY = ROT_270;
					break;
				case 0xB2:
					trackObj = "rest";
					rotY = ROT_90;
					break;
			}

			addTrackObj(trackObj, x, z, transX, transY, transZ, rotY);
			addTrackObj(trackObj2, x, z, transX, transY, transZ, invertSecondObj ? ROT_90 - rotY : rotY);

			addTrackObj(terrObj, x, z, 0, transY - 0.05, 0, rotY);
			addTrackObj(terrObj2, x, z, 0, transY - 0.05, 0, rotY);
		}
	}
}


function init() {

	CENTER = new THREE.Vector3(15 * TILE_SIZE, 0, -30 * TILE_SIZE);
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );

	rotY = 0;
	mouseY = 0;
	mouseZ = 0;

	camera.position.x = 15 * TILE_SIZE;
	camera.position.y = 50;
	camera.position.z = 10 * TILE_SIZE;

	// scene

	scene = new THREE.Scene();

	// light

	var light = new THREE.AmbientLight( 0xFFFFFF );
	light.position.set( 10, 0, 10 );
	scene.add( light );

	controls = new THREE.FlyControls(camera);

	renderer = new THREE.WebGLRenderer({'antialias':true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

	// Load track
	var oReq = new XMLHttpRequest();
	oReq.open("GET", "/trks/DEFAULT.TRK", true);
	oReq.responseType = "arraybuffer";

	var track = [], terrain = [];
	var horizon;
	for (var j = 0; j < 30; j++) {
		track[j] = [];
		terrain[j] = [];
	}

	oReq.onload = function (oEvent) {
		var arrayBuffer = oReq.response;
		if (arrayBuffer) {
			if (arrayBuffer.byteLength != 1802) {
				throw "Track size is not valid";
			}
			var x, y;
			var byteArray = new Uint8Array(arrayBuffer);
			for (y = 0; y < 30; y++) {
				for (x = 0; x < 30; x++) {
					track[y][x] = byteArray[y * 30 + x];
					terrain[y][x] = byteArray[0x385 + (29 - y) * 30 + x];   // 29 seems wrong...
				}
			}
			horizon = byteArray[0x384];

			loadTrack(track, horizon, terrain);
		}
	};

	// Load models
	var trackObjNames = [
		"bank", "barr", "brid", "btur", "cfen", "chi1", "chi2", "elsp", "fini", "gwro",
		"hpip", "lban", "loo1", "loop", "pipe", "pip2", "ramp", "rban", "rdup", "road",
		"selr", "sofl", "sofr", "spip", "stur", "sram", "vcor", "wroa",

		// Terrain
		"goui", "gouo", "goup", "hig1", "hig2", "hig3", "high",

		// Objects
		"barn", "boat", "cact", "gass", "offi", "palm", "rest", "tenn", "tree"
	];
	for (var nameIdx in trackObjNames) {
		var mtlLoader = new THREE.OBJMTLLoader();
		var objName = trackObjNames[nameIdx];
		mtlLoader.addEventListener("load", function(name){
			return function(hierarchy) {
				var obj = hierarchy.content;
				obj.scale.x = obj.scale.y = obj.scale.z = 0.01;
				trackObjs[name] = obj;
				var count = 0;
				for (var k in trackObjs) if (trackObjs.hasOwnProperty(k)) count++;
				if (count == trackObjNames.length) {
					// Load simple terrain
					var geometry = trackObjs["high"].children[0].geometry.clone();
					// TODO: Take color from stunts.mtl
					var material = new THREE.MeshBasicMaterial( { color: 0x59aa59 } );
					var plane = new THREE.Mesh( geometry, material );
					var planeObj = new THREE.Object3D();
					planeObj.scale = obj.scale;
					planeObj.add(plane);
					trackObjs["terr"] = planeObj;

					oReq.send(null);        // Load track
				}
			}
		}(objName));
		mtlLoader.load('objs/trk/' + objName + '.obj', 'objs/trk/stunts.mtl', {});
	}
}

function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

//

function animate() {
	requestAnimationFrame( animate );
	render();
	stats.update();
}

function render() {
	var delta = clock.getDelta();

	controls.movementSpeed = 1000 * delta;
	controls.rollSpeed = 10 * delta;
	controls.update( delta );

	renderer.render( scene, camera );
}

};
