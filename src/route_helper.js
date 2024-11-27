export default {
    /**
     *
     * @param {number} before direction in radian
     * @param {number} after direction in radian
     */
    getTurning(before, after) {
        let diff = after - before;
        if (diff > Math.PI) {
            diff -= 2 * Math.PI;
        } else if (diff < -Math.PI) {
            diff += 2 * Math.PI;
        }
        diff = (diff * 180) / Math.PI;
        if (diff > 120) {
            return "向左后方";
        }
        if (diff < -120) {
            return "向右后方";
        }
        if (diff > 60) {
            return "左转";
        }
        if (diff < -60) {
            return "右转";
        }
        if (diff > 25) {
            return "向左前方";
        }
        if (diff < -25) {
            return "向右前方";
        }
        return "直行";
    },
    /**
     * @param {Object} node1
     * @param {Object} node2
     * @returns {number} direction in radian
     */
    getDirection(node1, node2) {
        let lat1 = node1.lat;
        let lon1 = node1.lon;
        let lat2 = node2.lat;
        let lon2 = node2.lon;
        let dLat = lat2 - lat1;
        let dLon = lon2 - lon1;
        let angle = Math.atan2(dLat, dLon);
        return angle;
    },
    /**
     *
     * @param {Array} nodes
     * @param {Array} paths
     * @returns {Array}
     */
    getRouteDetails(nodes, paths) {
        let result = [];
        let pathPak = [];
        if (paths.length == 0) {
            return result;
        }
        let lastRoadName = paths[0].name;
        let lastNodeName = "";
        let lastStart = "";
        let totdistance = paths[0].distance;
        let lastSegmentTurn = "出发";
        let lastDirection = this.getDirection(
            nodes[paths[0].start],
            nodes[paths[0].end]
        );
        pathPak.push(paths[0]);
        let lastMethod = paths[0].method;
        for (let i = 1; i < paths.length; i++) {
            let path = paths[i];
            let node1 = nodes[path.start];
            let node2 = nodes[path.end];
            let direction = this.getDirection(node1, node2);
            if (node1.name != undefined) {
                lastNodeName = node1.name;
            }
            if (path.name != undefined) {
                if (path.name != lastRoadName) {
                    result.push({
                        from: lastStart,
                        to: lastNodeName,
                        roadName: lastRoadName,
                        distance: totdistance,
                        direction: lastSegmentTurn,
                        method: lastMethod,
                        paths: pathPak,
                    });
                    lastSegmentTurn = this.getTurning(lastDirection, direction);
                    lastRoadName = path.name;
                    totdistance = path.distance;
                    lastStart = "";
                    pathPak = [];
                }

                lastMethod = path.method;
            }
            if (lastStart == "" && node1.name != undefined) {
                lastStart = node1.name;
            }
            totdistance += path.distance;
            lastDirection = direction;
            pathPak.push(path);
        }
        result.push({
            from: lastStart,
            to: lastNodeName,
            roadName: lastRoadName,
            distance: totdistance,
            direction: lastSegmentTurn,
            method: lastMethod,
            paths: pathPak,
        });
        return result;
    },
};
