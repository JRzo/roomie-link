let settings = document.querySelector(".fa-gear");


settings.addEventListener("click", () =>{
    fetch("/profile/settings")
        .then(response => {
            if (response.ok) return response.json()
        })
        .then(data => {
            console.log(data)
        })

})