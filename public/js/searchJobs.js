// const url = 'https://jsearch.p.rapidapi.com/estimated-salary?job_title=nodejs%20developer&location=new%20york&location_type=ANY&years_of_experience=ALL';
// const options = {
// 	method: 'GET',
// 	headers: {
// 		'x-rapidapi-host': 'jsearch.p.rapidapi.com'
// 	}
// };

// try {
// 	const response = await fetch(url, options);
// 	const result = await response.text();
// 	console.log(result);
// } catch (error) {
// 	console.error(error);
// }






document.getElementById('submitButton').addEventListener("click", async () =>{

    // Get job keywors
    let jobName = document.querySelector("#keywords").value
    console.log(jobName)

    // Let locations
    let location = document.querySelector("#location").value;
    console.log(location)

    // Select Job
    let jobType = document.querySelector("#job-type").value 
    let jobT = jobType == "Select job type" ? jobType: "Any"
    console.log(jobType)
    // Experience
    let values = document.querySelector('#experience-level');
    let optionV = values.value == "Select experience level" ? values.value: "Any";
    console.log(optionV)

    // Fethicng the value

    const url = `https://jsearch.p.rapidapi.com/estimated-salary?job_title=${jobName}&location=${location}&location_type=ANY&years_of_experience=ALL`;
    const options = {
	    method: 'GET',
	    headers: {
		    'x-rapidapi-key': '3fdbe13286msh2038d6799b54b39p13ce11jsn8b1912373dfc',
		    'x-rapidapi-host': 'jsearch.p.rapidapi.com'
	    }   
    };

    try {
        const response = await fetch(url, options);
        const result = await response.text();

        const data = JSON.parse(result);  
        let currentJobTitle = data.data[0].job_title; 
        let locationJob = data.data[0].location;
        let salaryAvg = data.data[0].median_base_salary;
        let poster = data.data[0].publisher_name;
        let timePosted = data.data[0].salaries_updated_at;
        let linkPoster = data.data[0].publisher_link;

        // Pass the data into the page

        document.querySelector('#title').innerHTML = "Title: "+currentJobTitle;
        document.querySelector("#locationJob").innerHTML = "Location: "+ locationJob;
        document.querySelector("#salaryAvg").innerHTML = "Average Salary: " + salaryAvg
        document.querySelector("#poster").innerHTML = poster;
        document.querySelector("#lastUpdated").innerHTML = timePosted;
        document.querySelector('#linkJob').innerHTML = "View Job"
        document.querySelector('#linkJob').href = linkPoster
        console.log(currentJobTitle);
        console.log(result);
    } catch (error) {
        console.error(error);
    }
    })