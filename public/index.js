const container = document.querySelector('.girassol-container');

    function criarGirassol() {
        const girassol = document.createElement('div');
        girassol.classList.add('girassol');

        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;

        girassol.style.left = `${x}px`;
        girassol.style.top = `${y}px`;

        container.appendChild(girassol);
    }

    
    for (let i = 0; i < 40 ; i++) {
        criarGirassol();
    }

