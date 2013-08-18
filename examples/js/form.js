(function (A, create) {
    A.define({
        name: 'test-form',
        class: 'test-from',
        render: function (config) {
            var form = document.createElement('form');
            var input, button; 
            form.setAttribute('method', 'get');
            
            input = document.createElement('input');
            input.setAttribute('name', 'first-name');
            input.setAttribute('placeholder', 'First Name');
            form.appendChild(input);

            input = document.createElement('input');
            input.setAttribute('name', 'last-name');
            input.setAttribute('placeholder', 'Last Name');
            form.appendChild(input);
            
            button = document.createElement('button');
            button.innerHTML = 'Save';
            form.appendChild(button);
            return form;
        }
    });
})(Atto, document.createElement);