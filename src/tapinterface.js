const ssoServiceEndpoint = "https://account.tmysam.top/apis/";
const apiServiceEndpoint = "https://www.tmysam.top/tsmap/";

export class TAPInterface {
    checkLogin() {
        let url = ssoServiceEndpoint + "sso-interface.php?operation=0";
        return new Promise((resolve, reject) => {
            fetch(url, { credentials: "include" })
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    if (data.status == 0) {
                        resolve({ ok: true });
                    } else {
                        resolve({
                            ok: false,
                            noPermissionReason:
                                "未登录或邮件未验证，请在 TSStudio UAS(Universal Authentication System) 登录并验证邮件后重试。",
                        });
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
    /**
     * @api {post} /new_set.php Create a new point set
     * Request:
     *      Content-Type: application/json
     *      {
     *          "name": "name",
     *          "points": [
     *              {
     *                  "selected_lat":float,
     *                  "selected_lon":float,
     *                  "addr":string,
     *                  "type":string,
     *                  "nearest_node_id":uint64,
     *              },...
     *          ]
     *      }
     * Response:
     *      Content-Type: application/json
     *      {
     *          "status": "success" or "fail",
     *          "setid": uint64
     *      }
     */
    new_set(name, points) {
        let url = apiServiceEndpoint + "new_set.php";
        let data = {
            name: name,
            points: points,
        };
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
                credentials: "include",
            })
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
    /**
     * @api {post} /delete_set.php Delete a point set
     * Request:
     *      Content-Type: application/json
     *      {
     *          "setid": int
     *      }
     * Response:
     *      Content-Type: application/json
     *      {
     *          "status": "success" or "fail",
     *      }
     */
    delete_set(setid) {
        let url = apiServiceEndpoint + "delete_set.php";
        let data = {
            setid: setid,
        };
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
                credentials: "include",
            })
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
    /**
     * @api {post} /get_set.php Get points of a set
     * Request:
     *      Content-Type: application/json
     *      {
     *          "setid": int
     *      }
     * Response:
     *      Content-Type: application/json
     *      {
     *          "status": "success" or "fail",
     *          "points": [
     *              {
     *                  "selected_lat":float,
     *                  "selected_lon":float,
     *                  "addr":string,
     *                  "type":string,
     *                  "nearest_node_id":uint64,
     *              },...
     *          ]
     *      }
     */
    get_points(setid) {
        let url = apiServiceEndpoint + "get_set.php";
        let data = {
            setid: setid,
        };
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
                credentials: "include",
            })
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
    /**
     * @api {get} /get_sets.php Get all point sets
     * Request:
     *      Whatever
     * Response:
     *      Content-Type: application/json
     *      {
     *          "status": "success" or "fail",
     *          "sets": [
     *              {
     *                "setid": uint64
     *                "name": string
     *              }
     *          ]
     *      }
     */
    get_sets() {
        let url = apiServiceEndpoint + "get_sets.php";
        return new Promise((resolve, reject) => {
            fetch(url, { credentials: "include" })
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
}
