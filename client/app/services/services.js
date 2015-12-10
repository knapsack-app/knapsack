angular.module("knapsack.services", [])
  .service("Session", function() {
    this.create = function(sessionId, username) {
      this.id = sessionId;
      this.username = username;
    };
    this.destroy = function() {
      this.id = null;
      this.username = null;
    };
  })
  .factory("Auth", ["$http", "Session", function($http, Session) {
    var signUp = function(user) {
      return $http({
        method: "POST",
        url: "api/signup",
        data: user
      }).then(function succesCallback(resp) {
        if (resp.data.constructor === String && resp.data.search("already taken") > 0) {
          return "already exists";
        } else {
          Session.create(resp.data.id, resp.data.user);
          return resp.data.user;
        }
      }, function errorCallback(resp) {
        console.log(resp.status + ": failed to signup user");
        return resp;
      });
    };

    var signIn = function(user) {
      return $http({
        method: "POST",
        url: "api/signin",
        data: user
      }).then(function succesCallback(resp) {
        if (resp.data === "Wrong password" || resp.data.constructor === String) {
          return resp.data;
        }
        Session.create(resp.data.id, resp.data.user);
        return resp.data.user;
      }, function errorCallback(resp) {
        console.log(resp.status + ": incorrect username or password");
        return resp;
      });
    };

    var logOut = function(user) {
      return $http({
        method: "POST",
        url: "api/logout",
        data: JSON.stringify({
          user: user
        })
      }).then(function succesCallback(resp) {
        console.log("succesfully logged out");
        Session.destroy();
        return resp;
      }, function errorCallback(resp) {
        console.log(resp.status + ": unable to logout");
        return resp;
      });
    };

    var isAuthenticated = function() {
      return !!Session.username;
    };

    return {
      signIn: signIn,
      signUp: signUp,
      isAuthenticated: isAuthenticated,
      logOut: logOut
    };

  }])


.factory("Collections", ["$http", function($http) {

    // get all collection names (ex. bestsellers, wine, ...)
    var getAll = function() {
      return $http({
        method: "GET",
        url: "api/collections"
      }).then(function succesCallback(resp) {
        console.log(resp.status + ":successfully fetched all collections");
        return resp.data;
      }, function errorCallback(resp) {
        console.log(resp.status + ": failed fetching collections from server");
      });
    };

    // add a new collection (ex. boats) to the current user
    var addCollection = function(collection) {
      return $http({
        method: "POST",
        url: "api/collections",
        data: JSON.stringify({
          collection: collection
        })
      }).then(function succesCallback(resp) {
        console.log(resp.status + ": succesfully added Collection");
      }, function errorCallback(resp) {
        console.log(resp.status + ": failed adding Collection");
      });
    };

    //remove a collection from the collection list for current user
    var removeCollection = function(collection) {
      return $http({
        method: "POST",
        url: "api/collections/delete",
        data: JSON.stringify({
          collection: collection
        })
      }).then(function succesCallback(resp) {
        console.log(resp.status + ": succesfully deleted Collection");
      }, function errorCallback(resp) {
        console.log(resp.status + ": failed deleting Collection");
      });
    };

    var shareCollection = function(collection, user) {
      return $http({
        method: "POST",
        url: "api/collections/share",
        data: JSON.stringify({
          collection: collection,
          user: user
        })
      }).then(function succesCallback(resp) {
        console.log(resp.status + ": succesfully shared collection");
      }, function errorCallback(resp) {
        console.log(resp.status + ": failed sharing collection");
      });
    };

    return {
      getAll: getAll,
      addCollection: addCollection,
      removeCollection: removeCollection,
      shareCollection: shareCollection
    };

  }])
  .factory("Contents", ["$http", function($http) {
    //Molly's NYTimes Bestsellers API key / URI.
    //http://api.nytimes.com/svc/books/v3/lists.json?list-name=hardcover-fiction&api-key=b2f850985c69c53458eac07ce2f7a874%3A7%3A65642337

    var getNytimes = function() {
      return $http({
          method: "GET",
          url: "api/collection/nytimes"
        })
        .then(function(resp) {
          console.log("succesfully fetched nytimes bestsellers");
          return resp.data;
        });
    };

    var getBooks = function(collection) {
      return $http({
          method: "POST",
          url: "/api/collection/instance",
          data: JSON.stringify({
            collection: collection
          })
        })
        .then(function succesCallback(resp) {
          console.log("successfully fetched books for: " + collection + "from db");
          return resp.data;
        }, function errorCallback(resp) {
          console.log(resp.status + ": failed loading books for collection " + collection);
        });
    };

    var addBook = function(collection, book) {
      return $http({
          method: "POST",
          url: "/api/collection",
          data: JSON.stringify({
            collection: collection,
            book: book
          })
        })
        .then(function succesCallback(resp) {
          console.log("succesfully saved book into: " + collection);
        }, function errorCallback(resp) {
          console.log(resp.status + ": failed adding book to collection");
        });
    };

    var removeBook = function(collection, book) {
      return $http({
          method: "POST",
          url: "/api/collection/delete",
          data: JSON.stringify({
            collection: collection,
            book: book
          })
        })
        .then(function succesCallback(resp) {
          console.log("succesfully deleted book from: " + collection);
        }, function errorCallback(resp) {
          console.log("failed deleting book from: " + collection);
        });
    };

    var shareBook = function(collection, book, user) {
      return $http({
          method: "POST",
          url: "/api/collection/share",
          data: JSON.stringify({
            collection: collection,
            book: book,
            user: user
          })
        })
        .then(function succesCallback(resp) {
          console.log("succesfully shared book with user: " + user);
        }, function errorCallback(resp) {
          console.log(resp.status + ": failed sharing book with user: " + user);
        });
    };


    var getFriends = function() {
      return $http({
          method: "GET",
          url: "/api/friends"
        })
        .then(function succesCallback(resp) {
          console.log("successfully fetched friends from server.");
          return resp.data;
        }, function errorCallback(resp) {
          console.log(resp.status + ": failed loading friends");
        });
    };


    return {
      getBooks: getBooks,
      addBook: addBook,
      removeBook: removeBook,
      getNytimes: getNytimes,
      getFriends: getFriends,
      shareBook: shareBook
    };

  }]);
