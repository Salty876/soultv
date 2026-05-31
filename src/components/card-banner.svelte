<head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&family=Ubuntu&display=swap" rel="stylesheet">
</head>




<script>

  
    export let title
    export let poster
    export let animeID
    export let episodes

  
</script>

<a href="/anime/{animeID}">
<div class="banner">

    <img src="{poster}" alt='{title} poster'>

    <div class="text">
        {#if title.length < 40}
            <h3 class="anime-title">{title}</h3>
        {:else}
            <h3 class="anime-title">{title.slice(0,40)}...</h3>
        {/if}
        {#if episodes}
            <p>{episodes} Episodes</p>
        {/if}
    </div>
</div>
</a>

<style>
    p{
        font-family: "Rubik", sans-serif;
        font-optical-sizing: auto;
        font-weight: 500;
        font-style: normal;
    }

    h3{
        font-family: "Rubik", sans-serif;
        font-optical-sizing: auto;
        font-weight: 500;
        font-style: normal;
    }
    .banner{
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        width: 100%;
        height: 10vh;
        padding-top: 1vh;
        padding-bottom: 1vh;

    }

    img{
        object-fit: contain;
        height: 10vh;
    }


    .text{
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-left: 0.5vw;
 
    }
    a{
        text-decoration: none;
        color: white;
    }

</style>
