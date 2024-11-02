onmessage = function (e) {
    if (e.data.coords == undefined) {
        resolvEmpty(e);
        return;
    }
    draw(e.data.coords.x, e.data.coords.y, e.data.coords.z, e.data.type, e);
};

function resolvEmpty(e) {
    const imageData = new ImageData(settings.tileSize, settings.tileSize);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
    }
    resolv(imageData, e);
}

function resolv(data, e) {
    postMessage({ id: e.data.id, imageData: data });
}

const settings = {
    tileSize: 256,
};
function tile2long(x, z) {
    return (x / Math.pow(2, z)) * 360 - 180;
}
function tile2lat(y, z) {
    var n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function get_xy(lat, lon, lat_begin, lon_begin, lat_end, lon_end) {
    const x = Math.floor(
        ((lon - lon_begin) / (lon_end - lon_begin)) * settings.tileSize
    );
    const y = Math.floor(
        ((lat - lat_begin) / (lat_end - lat_begin)) * settings.tileSize
    );
    return { x: x, y: y };
}

async function get_nodes(lat_begin, lon_begin, lat_end, lon_end, level) {
    //get nodes from server
    //http://localhost:11222/nodes?lat_min= &lat_max= &lon_min= &lon_max= &level=
    //return nodes
    //[{"id":4452189895,"lat":34.0967671,"lon":133.0417131}]
    return fetch(
        `http://local.tmysam.top:11222/nodes?lat_min=${lat_end}&lat_max=${lat_begin}&lon_min=${lon_begin}&lon_max=${lon_end}&level=${level}`
    ).then((response) => response.json());
}

function draw(x, y, z, type, e) {
    const imageData = new ImageData(settings.tileSize, settings.tileSize);
    const data = imageData.data;

    //draw x y z text
    const lat_begin = tile2lat(y, z);
    const lon_begin = tile2long(x, z);
    const lat_end = tile2lat(y + 1, z);
    const lon_end = tile2long(x + 1, z);
    const text = `lat:${lat_begin.toFixed(3)}-${lat_end.toFixed(3)}`;
    const text2 = `lon:${lon_begin.toFixed(3)}-${lon_end.toFixed(3)}`;
    const fontSize = 20;
    const font = `${fontSize}px Arial`;

    const canvas = new OffscreenCanvas(settings.tileSize, settings.tileSize);
    const ctx = canvas.getContext("2d");
    if (type == "basic") {
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, settings.tileSize, settings.tileSize);
        ctx.font = font;
        ctx.fillStyle = "white";
        ctx.fillText(text, 10, 30);
        ctx.fillText(text2, 10, 60);
        //draw borders
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(settings.tileSize, 0);
        ctx.lineTo(settings.tileSize, settings.tileSize);
        ctx.lineTo(0, settings.tileSize);
        ctx.lineTo(0, 0);
        ctx.strokeStyle = "white";
        ctx.stroke();
    }

    //draw nodes
    get_nodes(lat_begin, lon_begin, lat_end, lon_end, z).then((dat) => {
        let Nodes = {};
        dat.nodes.forEach((node) => {
            Nodes[node.id] = node;
        });
        dat.edges.forEach((edge) => {
            const start = Nodes[edge.start];
            const end = Nodes[edge.end];
            if (start == undefined || end == undefined) {
                return;
            }
            const start_x = get_xy(
                start.lat,
                start.lon,
                lat_begin,
                lon_begin,
                lat_end,
                lon_end
            ).x;
            const start_y = get_xy(
                start.lat,
                start.lon,
                lat_begin,
                lon_begin,
                lat_end,
                lon_end
            ).y;
            const end_x = get_xy(
                end.lat,
                end.lon,
                lat_begin,
                lon_begin,
                lat_end,
                lon_end
            ).x;
            const end_y = get_xy(
                end.lat,
                end.lon,
                lat_begin,
                lon_begin,
                lat_end,
                lon_end
            ).y;
            ctx.beginPath();
            ctx.moveTo(start_x, start_y);
            ctx.lineTo(end_x, end_y);
            //#33FF33
            ctx.strokeStyle = "#77FF77";
            ctx.stroke();
        });
        const textData = ctx.getImageData(
            0,
            0,
            settings.tileSize,
            settings.tileSize
        );
        for (let i = 0; i < data.length; i += 4) {
            data[i] = textData.data[i];
            data[i + 1] = textData.data[i + 1];
            data[i + 2] = textData.data[i + 2];
            data[i + 3] = textData.data[i + 3];
        }
        resolv(imageData, e);
    });
}
