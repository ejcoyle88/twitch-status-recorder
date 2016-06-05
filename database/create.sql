--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.2
-- Dumped by pg_dump version 9.5.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- Name: streamer_id_seq; Type: SEQUENCE; Schema: public; Owner: uhqfwitkqqzcwz
--

CREATE SEQUENCE streamer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE streamer_id_seq OWNER TO uhqfwitkqqzcwz;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: streamer; Type: TABLE; Schema: public; Owner: uhqfwitkqqzcwz
--

CREATE TABLE streamer (
    id integer DEFAULT nextval('streamer_id_seq'::regclass) NOT NULL,
    name text NOT NULL
);


ALTER TABLE streamer OWNER TO uhqfwitkqqzcwz;

--
-- Name: streamer_status_id_seq; Type: SEQUENCE; Schema: public; Owner: uhqfwitkqqzcwz
--

CREATE SEQUENCE streamer_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE streamer_status_id_seq OWNER TO uhqfwitkqqzcwz;

--
-- Name: streamer_status; Type: TABLE; Schema: public; Owner: uhqfwitkqqzcwz
--

CREATE TABLE streamer_status (
    id integer DEFAULT nextval('streamer_status_id_seq'::regclass) NOT NULL,
    status text NOT NULL,
    streamer_id integer NOT NULL,
    "timestamp" timestamp without time zone NOT NULL
);


ALTER TABLE streamer_status OWNER TO uhqfwitkqqzcwz;

--
-- Name: streamer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: uhqfwitkqqzcwz
--

SELECT pg_catalog.setval('streamer_id_seq', 2, true);


--
-- Name: streamer_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: uhqfwitkqqzcwz
--

SELECT pg_catalog.setval('streamer_status_id_seq', 1, true);


--
-- Name: streamer_pkey; Type: CONSTRAINT; Schema: public; Owner: uhqfwitkqqzcwz
--

ALTER TABLE ONLY streamer
    ADD CONSTRAINT streamer_pkey PRIMARY KEY (id);


--
-- Name: streamer_status_pkey; Type: CONSTRAINT; Schema: public; Owner: uhqfwitkqqzcwz
--

ALTER TABLE ONLY streamer_status
    ADD CONSTRAINT streamer_status_pkey PRIMARY KEY (id);


--
-- Name: streamer_status_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: uhqfwitkqqzcwz
--

ALTER TABLE ONLY streamer_status
    ADD CONSTRAINT streamer_status_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES streamer(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: uhqfwitkqqzcwz
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM uhqfwitkqqzcwz;
GRANT ALL ON SCHEMA public TO uhqfwitkqqzcwz;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

