import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router";
import Nav from "components/nav/nav";
import { FileList } from 'components/search/list';
import { newView } from "app";

export default function Topics() {
    const path = useLocation().pathname;
    const [topics, setTopics] = useState([]);

    useEffect(() => {
        async function loadTopics() {
            const resp = await fetch("/api/topics");
            const results = await resp.json();
            setTopics(results);
        }
        loadTopics();
    }, [])
    console.log(topics)
    return (
        <>
            <Nav path={path} />
            <TopicsList topics={topics} />
        </>
    )
}

function TopicsList({topics}: {topics: string[]}) {
    return (
        <>
            <section id="topics">
            {topics.map((topic, i) => (
                <Link key={i} to={topic}>{topic}</Link>
            ))}
            </section>
        </>
    )
}

export function Topic() {
    const path = useLocation().pathname;
    const [topic, setTopics] = useState(newView());

    useEffect(() => {
        async function loadTopic() {
            const resp = await fetch("/api" + path);
            const results = await resp.json();
            setTopics(results);
        }
        loadTopic();
    }, [path])
    return (
        <>
            <Nav path={path} />
            <section id="files">
            <FileList files={topic.dir.files} />
            </section>
        </>
    )
}