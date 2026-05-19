//Funzione che carica una texture
function loadTexture(gl, path, fileName) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	const pixel = new Uint8Array([255, 255, 255, 255]);  // opaque white
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

	if(fileName){
		const image = new Image();
		image.onload = function() {
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			if (isPowerOf2(image.width) && isPowerOf2(image.height)) 
				gl.generateMipmap(gl.TEXTURE_2D); // Yes, it's a power of 2. Generate mips.
			else {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			}
		};
		image.src = path + fileName;
	}
	return texture;

	function isPowerOf2(value) {
		return (value & (value - 1)) == 0;
	}
}

//Funzione che utilizza la libreria glm_utils per leggere un eventuale 
//file MTL associato alla mesh
async function readMTLFile(MTLfileName, mesh) {
	try {
		const response = await fetch(MTLfileName);

		if (!response.ok) {
			throw new Error(`Errore HTTP! Stato: ${response.status}`);
		}

		const text = await response.text();
		glmReadMTL(text, mesh);

	} catch (error) {
		console.error("Errore nel caricamento del file:", error);
	}
}

//Funzione che serve per recuperare i dati della mesh da un file OBJ
async function retrieveDataFromSource(mesh){
	await loadMeshFromOBJ(mesh);
	if(mesh.fileMTL) {
		await readMTLFile(mesh.sourceMesh.substring(0, mesh.sourceMesh.lastIndexOf("/")+1) + mesh.fileMTL, mesh.data); 
		mesh.materials = mesh.data.materials;
		delete mesh.data.materials;
	}
}

//Funzione che utilizza la libreria glm_utils per leggere un file OBJ
async function loadMeshFromOBJ(mesh) {
	try {
		const response = await fetch(mesh.sourceMesh);

		if (!response.ok) {
			throw new Error(`Errore HTTP! Stato: ${response.status}`);
		}

		const resultText = await response.text();

		// Chiamiamo il parser (assumendo che subd_mesh sia disponibile globalmente)
		var result = glmReadOBJ(resultText, new subd_mesh());
		// Assegniamo i dati alla struttura mesh
		mesh.data = result.mesh;
		mesh.fileMTL = result.fileMtl;

	} catch (error) {
		console.error('Errore durante il caricamento della mesh: ' + error.message);
		throw error; 
	}
}

/*========== Loading and storing the geometry ==========*/
async function LoadMesh(gl,mesh) {

	await retrieveDataFromSource(mesh);
	Unitize(mesh.data);

	// Safely identify active material entry
	var activeMaterial = mesh.materials[0];
	if (mesh.fileMTL != null && mesh.materials && mesh.materials.length > 1) {
		activeMaterial = mesh.materials[1] || mesh.materials[0];
	} else if (mesh.materials && mesh.materials.length > 0) {
		activeMaterial = mesh.materials[0];
	}

	var path = mesh.sourceMesh.substring(0, mesh.sourceMesh.lastIndexOf("/")+1);

	// Load map texture with safe parameter check fallback
	var textureFileName = "Cthulhu_2k_Base_Color.png";
	if (activeMaterial && activeMaterial.parameter) {
		if (activeMaterial.parameter.has("map_Kd") && activeMaterial.parameter.get("map_Kd")) {
			textureFileName = activeMaterial.parameter.get("map_Kd");
		}
		activeMaterial.parameter.set("map_Kd", loadTexture(gl, path, textureFileName));
	}

	var x=[], y=[], z=[];
	var xn=[], yn=[], zn=[];
	var xt=[], yt=[];
	var i0,i1,i2;
	var nvert=mesh.data.nvert;
	var nface=mesh.data.nface;
	var ntexcoord=mesh.data.textCoords.length;
	var nnormals=mesh.data.normal.length;
	var ambient, diffuse, specular, emissive, shininess, opacity;
var positions = [];
var normals = [];
var texcoords = [];

	for (var i=0; i<nvert; i++){
		x[i]=mesh.data.vert[i+1].x;
		y[i]=mesh.data.vert[i+1].y;
		z[i]=mesh.data.vert[i+1].z;       
	}
	for (var i=0; i<nnormals-1; i++){
		xn[i]=mesh.data.normal[i+1].i;
		yn[i]=mesh.data.normal[i+1].j;
		zn[i]=mesh.data.normal[i+1].k;       
	}
	for (var i=0; i<ntexcoord-1; i++){
		xt[i]=mesh.data.textCoords[i+1].u;
		yt[i]=mesh.data.textCoords[i+1].v;      
	}
	for (var i=1; i<=nface; i++){
		i0=mesh.data.face[i].vert[0]-1;
		i1=mesh.data.face[i].vert[1]-1;
		i2=mesh.data.face[i].vert[2]-1;
		positions.push(x[i0],y[i0],z[i0],x[i1],y[i1],z[i1],x[i2],y[i2],z[i2]);

		i0=mesh.data.face[i].textCoordsIndex[0]-1;
		i1=mesh.data.face[i].textCoordsIndex[1]-1;
		i2=mesh.data.face[i].textCoordsIndex[2]-1;
		texcoords.push(xt[i0],yt[i0],xt[i1],yt[i1],xt[i2],yt[i2]);

		if(nnormals>1){
			i0=mesh.data.face[i].normalVertexIndex[0]-1;
			i1=mesh.data.face[i].normalVertexIndex[1]-1;
			i2=mesh.data.face[i].normalVertexIndex[2]-1;
			normals.push(xn[i0],yn[i0],zn[i0],xn[i1],yn[i1],zn[i1],xn[i2],yn[i2],zn[i2]);
		}else{
			i0=mesh.data.facetnorms[i].i;
			i1=mesh.data.facetnorms[i].j;
			i2=mesh.data.facetnorms[i].k;
			normals.push(i0,i1,i2,i0,i1,i2,i0,i1,i2);
		}
	}         
	numVertices=3*nface;


	// Extract vectors from active material cleanly
	if (activeMaterial && activeMaterial.parameter) {
		ambient = activeMaterial.parameter.get("Ka") || [0.2, 0.2, 0.2];
		diffuse = activeMaterial.parameter.get("Kd") || [1.0, 1.0, 1.0];
		specular = activeMaterial.parameter.get("Ks") || [1.0, 1.0, 1.0];
		emissive = activeMaterial.parameter.get("Ke") || [0.0, 0.0, 0.0];
		shininess = activeMaterial.parameter.get("Ns") || 100.0;
		opacity = activeMaterial.parameter.get("Ni") || 1.0;
	}
	
	dataObj = {
		position: { numComponents: 3, data: positions },
		normal: { numComponents: 3, data: normals },
		texcoord: { numComponents: 2, data: texcoords },
	};

	
	dataUniform = {
		diffuse: diffuse,
		ambient: ambient,
		specular: specular,
		emissive: emissive,
		shininess: shininess,
		opacity: opacity
	};
}
