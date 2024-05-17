import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router';
import Nav from 'parts/nav/nav';
import { FileList } from 'views/search/list';
import { newView } from 'app';

export type topic = {
    name: string;
    len: number;
    lastDate: number;
}

export function newTopics(): topic[] {
    return []
}


export default function Topics() {
    const path = useLocation().pathname;
    const [topics, setTopics] = useState(newTopics());

    useEffect(() => {
        async function loadTopics() {
            const resp = await fetch("/api/topics");
            const results = await resp.json();
            console.log(results)
            setTopics(results);
        }
        loadTopics();
    }, [])
    return (
        <>
            <Nav path={path} />
            <h1 className="title">topics</h1>
            <TopicsList topics={topics} />
        </>
    )
}

function TopicsList({topics}: {topics: topic[]}) {
    return (
        <>
            <section id="topics">
            {topics.map((topic, i) => (
                <span key={i} className="topic"><Link to={topic.name}>{topic.name}</Link>({topic.len})</span>
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
            <h1 className="title">{topic.path}</h1>
            <section id="files">
            <FileList files={topic.dir.files} />
            </section>
        </>
    )
}