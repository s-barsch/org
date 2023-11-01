import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router";
import Nav from "components/nav/nav";

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
                <Link to={topic}>{topic}</Link>
            ))}
            </section>
        </>
    )
}