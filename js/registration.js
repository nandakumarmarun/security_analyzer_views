// Create a Form object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.
if (!this.Registraion) {
  this.Registraion = {};
}

(function () {
  "use strict";

  var formContextPath =
    location.protocol + "//" + location.host + location.pathname;

  var createEditForm = $("#regForm");
  var deleteForm = $("#deleteForm");

  var registrationModel = {
    firstName: null,
    lastName: null,
    email: null,
    login: null,
    password: null,
  };

  var loginModel = {
    login: null,
    password: null,
  };

  // Specify the validation rules
  var validationRules = {
    firstname: {
      required: true,
    },
    email: {
      required: true,
    },
    email: {
      required: true,
    },
    login: {
      required: true,
    },
    password: {
      required: true,
      maxlength: 8,
    },
  };

  // Specify the validation error messages
  var validationMessages = {
    login: {
      required: "This field is required.",
      maxlength: "This field cannot be longer than 255 characters.",
    },
    password: {
      required: "This field is required.",
      maxlength: "This field cannot be longer than 255 characters.",
    },
  };

  $(document).ready(function () {
    // add the rule here
    $.validator.addMethod(
      "valueNotEquals",
      function (value, element, arg) {
        return arg != value;
      },
      ""
    );

    createEditForm.validate({
      rules: validationRules,
      messages: validationMessages,
      submitHandler: function (form) {
        createUpdateForm();
      },
    });

    deleteForm.submit(function (e) {
      // prevent Default functionality
      e.preventDefault();
      // pass the action-url of the form
      deleteForm1(e.currentTarget.action);
    });
  });

  function createUpdateForm() {
    console.log("hello")
    registrationModel.firstName = $("#inputfirstname").val();
    registrationModel.login = $("#inputusername").val();
    registrationModel.lastName = $("#inputLastname").val();
    registrationModel.email = $("#inputEmail").val();
    registrationModel.password = $("#inputPassword").val();
    $.ajax({
      method: "POST",
      url: "http://localhost:8081/api/v1/user/register",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(registrationModel),
      success: function (data) {
          createEditForm.trigger("reset");
          getToken(registrationModel)
      },
      error: function (xhr, error) {
        onError(xhr, error);
      },
    });
  }

  
  function getToken(data) {
		loginModel.login = data.login
		loginModel.password = data.password
		$.ajax({
			method : 'POST',
			url : "http://localhost:8081/api/v1/auth/authenticate",
			contentType : "application/json; charset=utf-8",
			data : JSON.stringify(loginModel),
			success : function(data) {
        localStorage.setItem('token', data.token);
        location.href = "http://localhost:3000/HTML/new"
				onSaveSuccess(data);
			},
			error : function(xhr, error) {
				onError(xhr, error);
			}
		});
	}

  // function onSaveSuccess(result) {
  //   // reloading page to see the updated data
  //   window.location = formContextPath;
  // }

  function onDeleteSuccess(result) {
    // reloading page to see the updated data
    window.location = formContextPath;
  }

  Registraion.showModalPopup = function (el, id, action, obj) {
    resetForm();
    if (id) {
      switch (action) {
        case 0:
          showForm(id, obj);
          break;
        case 1:
          editForm(id);
          createEditForm.attr("method", "PUT");
          break;
        case 2:
          deleteForm.attr("action", formContextPath + "/" + id);
          break;
        case 3:
          loadQuestions(id);
          break;
      }
    }
    el.modal("show");
  };

  Registraion.closeModalPopup = function (el) {
    el.modal("hide");
  };

  function resetForm() {
    $(".alert").hide();
    createEditForm.trigger("reset"); // clear form fields
    createEditForm.validate().resetForm(); // clear validation messages
    createEditForm.attr("method", "POST"); // set default method
    formModel.pid = null; // reset form model;
  }

  function addErrorAlert(message, key, data) {
    $(".alert > p").html(message);
    $(".alert").show();
  }

  function onError(httpResponse, exception) {
    var i;
    switch (httpResponse.status) {
      // connection refused, server not reachable
      case 0:
        addErrorAlert("Server not reachable", "error.server.not.reachable");
        break;
      case 400:
        var errorHeader = httpResponse.getResponseHeader(
          "X-orderfleetwebApp-error"
        );
        var entityKey = httpResponse.getResponseHeader(
          "X-orderfleetwebApp-params"
        );
        if (errorHeader) {
          var entityName = entityKey;
          addErrorAlert(errorHeader, errorHeader, {
            entityName: entityName,
          });
        } else if (httpResponse.responseText) {
          var data = JSON.parse(httpResponse.responseText);
          if (data && data.fieldErrors) {
            for (i = 0; i < data.fieldErrors.length; i++) {
              var fieldError = data.fieldErrors[i];
              var convertedField = fieldError.field.replace(/\[\d*\]/g, "[]");
              var fieldName =
                convertedField.charAt(0).toUpperCase() +
                convertedField.slice(1);
              addErrorAlert(
                "Field " + fieldName + " cannot be empty",
                "error." + fieldError.message,
                {
                  fieldName: fieldName,
                }
              );
            }
          } else if (data && data.message) {
            addErrorAlert(data.message, data.message, data);
          } else {
            addErrorAlert(data);
          }
        } else {
          addErrorAlert(exception);
        }
        break;
      default:
        if (httpResponse.responseText) {
          var data = JSON.parse(httpResponse.responseText);
          if (data && data.description) {
            addErrorAlert(data.description);
          } else if (data && data.message) {
            addErrorAlert(data.message);
          } else {
            addErrorAlert(data);
          }
        } else {
          addErrorAlert(exception);
        }
    }
  }
})();