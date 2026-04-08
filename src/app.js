const express = require('express');
const path = require('path');
require('dotenv').config()
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const { createClient } = require('@sanity/client')
const imageUrlBuilder = require('@sanity/image-url').default


const app = express();
const port = 3000


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride())


const client = createClient({
    projectId: process.env.sanityProjectId,
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: true
})

const builder = imageUrlBuilder(client)

app.use((req, res, next) => {
    res.locals.imageUrl = (source) => builder.image(source).url()
    next()
})


const handleRequest = async () => {
    const home = await client.fetch(`*[_type == "home"][0]`);
    const about = await client.fetch(`*[_type == "about"][0]`);
    const projects = await client.fetch(`*[_type == "case"]`);
    const navigation = await client.fetch(`*[_id == "navigation"][0]`);
    const footer = await client.fetch(`*[_id == "footer"][0]`);

    return { home, about, navigation, projects, footer }

}


const colorHandle = (page) => {
    const { backgroundColor, textColor } = page.colors

    return { backgroundColor, textColor }

}

/**
 * Home.
 */
app.get('/', async (req, res) => {
    const page = 'home'

    const defaults = await handleRequest()
    const colors = colorHandle(defaults.home)


    res.render('pages/home', { ...defaults, page, colors });
});

/**
 * About.
 */
app.get('/about', async (req, res) => {
    const page = 'about'

    const defaults = await handleRequest()
    const colors = colorHandle(defaults.about)

    res.render('pages/about', { ...defaults, page, colors });

});

/**
 * Case.
 */
app.get('/case/:id', async (req, res) => {
    const page = 'case'
    const slug = req.params.id;

    const defaults = await handleRequest()

    const query = `{
        "currentProject": *[_type == "case" && slug.current == $slug][0],
        "nextProject": *[_type == "case" && caseIndex > *[_type == "case" && slug.current == $slug][0].caseIndex] | order(caseIndex asc)[0],
        "firstProject": *[_type == "case"] | order(caseIndex asc)[0]
    }`;

    const data = await client.fetch(query, { slug });

    const currentProject = data.currentProject;
    const nextProject = data.nextProject || data.firstProject;

    if (!currentProject) {
        return res.status(404).send('Project not found');
    }

    const colors = colorHandle(currentProject)

    res.render('pages/case', {
        ...defaults,
        page,
        currentProject,
        nextProject,
        colors
    });

});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});