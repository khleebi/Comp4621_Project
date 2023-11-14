const Authentication = (function() {
    // This stores the current signed-in user
    let user = null;

    // This function gets the signed-in user
    const getUser = function() {
        return user;
    }

    // This function sends a sign-in request to the server
    // * `username`  - The username for the sign-in
    // * `password`  - The password of the user
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const signIn = function(username, password, socketId) {

        let data = {username : username, password : password, socketId: socketId};
        console.log(data)
        fetch("/signIn", {
            method : "POST",
            headers : {"Content-Type": "application/json"},
            body : JSON.stringify(data)
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "success") {
                    user = username;
                    $(".user-name").get(0).innerText = user;
                    $("#signin-overlay").hide();
                    $("#Intro").show();
                }
                else alert(res.error);
            })
            .catch(() => alert("internal error"));
    };

    const register = function(username, password, socketId) {

        let data = {username : username, password : password, socketId: socketId};

        fetch("/register", {
            method : "POST",
            headers : {"Content-Type": "application/json"},
            body : JSON.stringify(data)
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "success") {
                    user = username;
                    alert("You have created a new account! Press confirm to login.")
                    $(".user-name").get(0).innerText = user;
                    $("#signin-overlay").hide();
                    $("#Intro").show();
                }
                else alert(res.error);
            })
            .catch(() => alert("internal error"));
    }



    return {
        getUser,
        signIn,
        register
        };
})();
