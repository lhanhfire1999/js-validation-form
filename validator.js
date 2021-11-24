function Validator(selector){
  const formRules = {};
  const validatorRules = {
    required(value){
      return value.trim() ? undefined : 'Please enter this field'
    },
    email(value){
      const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(value.toLowerCase()) ? undefined : `Email don't valid. Please re-enter email`
    },
    min(min){
      return function(value){
        return value.length >= min ? undefined : `Please enter least ${min} characters`
      }
    },
    confirm(selector){
      return function(value){
        return value === document.querySelector(selector).value ? undefined : `Re-password don't exact`
      }
    },


  };

  const formElement = document.querySelector(selector); 
  if(formElement){
    const inputs = formElement.querySelectorAll('[name][rules]');

    // Take key(input.name) : value([] contains all roles) to save formRules
    for(let input of inputs){
      // String array
      let rules = input.getAttribute('rules').split('|');
      
      rules = Array.from(rules).map(rule => {
        if(rule.includes(':')){
          const ruleInfo = rule.split(':');
          rule = ruleInfo[0]
          return validatorRules[rule](ruleInfo[1]);
        }
        return validatorRules[rule]
      })

      formRules[input.name] = rules;


      // handle listen event to validate
      input.onblur = handleValidate;
      input.oninput = handleClearError;
      
    }

    function handleValidate(e){
      const rules = formRules[e.target.name];
      let errorMessage;
      
      for(const rule of rules){
        errorMessage = rule(e.target.value);
        if(errorMessage) break;
      }

      const formGroupElement = e.target.closest('.form-group');
      const formMessElement = formGroupElement.querySelector('.form-message');

      if(!formGroupElement) return;

      if(errorMessage){
        formGroupElement.classList.add('invalid');
        formMessElement.innerText = errorMessage;
      }

      return errorMessage;
    }

    function handleClearError(e){
      const formGroupElement = e.target.closest('.form-group');
      const formMessElement = formGroupElement.querySelector('.form-message');

      if(!formGroupElement) return;

      if(formGroupElement.classList.contains('invalid')){
        formGroupElement.classList.remove('invalid');
      }
      formMessElement.innerText = '';
    }
  }
  // handle submit form
  formElement.onsubmit = (e)=> {
    e.preventDefault();
    const inputs = formElement.querySelectorAll('[name][rules]');
    let isValidForm = true;

    for(let input of inputs){
      if(handleValidate({target: input})){
        isValidForm = false;
      }
    }

    if(isValidForm){
      if(typeof this.onSubmit === 'function'){
        const enableInputs = formElement.querySelectorAll('[name]:not([disabled])');

        const formValues =  Array.from(enableInputs).reduce((values, input) => {
          switch(input.type){
            case 'checkbox':
              if(input.matches(':checked')){
                if(!Array.isArray(values[input.name])){
                  values[input.name] = [];
                }
                values[input.name].push(input.value)
              }
              else if (!values[input.name]){
                values[input.name] = '';
              }
              break;

            case 'radio':
              if(input.matches(':checked')){
                values[input.name] = input.value;
              }
              else if(!values[input.name]){
                values[input.name] = '';
              }
              break;

            case 'file':
              values[input.name] = input.files; 
            break;

            default:
              values[input.name] = input.value;
          }
          return values;
        }, {});

        this.onSubmit(formValues);
      }
      else{
        formElement.submit();
      }
    } 
  };
}