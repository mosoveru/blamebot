--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- DCL
--

CREATE USER blamebot_admin WITH ENCRYPTED PASSWORD 'blamebot';
CREATE DATABASE blamebot_db OWNER blamebot_admin;
\c blamebot_db

--
-- Name: GitObjectTypes; Type: TYPE; Schema: public; Owner: blamebot_admin
--

CREATE TYPE public."GitObjectTypes" AS ENUM (
    'issue',
    'request'
);


ALTER TYPE public."GitObjectTypes" OWNER TO blamebot_admin;

--
-- Name: GitProviders; Type: TYPE; Schema: public; Owner: blamebot_admin
--

CREATE TYPE public."GitProviders" AS ENUM (
    'GITLAB',
    'GITEA'
);


ALTER TYPE public."GitProviders" OWNER TO blamebot_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: instance_users; Type: TABLE; Schema: public; Owner: blamebot_admin
--

CREATE TABLE public.instance_users (
    "instanceUserId" character varying NOT NULL,
    "instanceId" character varying NOT NULL,
    "telegramUserId" character varying NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    pathname character varying NOT NULL
);


ALTER TABLE public.instance_users OWNER TO blamebot_admin;

--
-- Name: instances; Type: TABLE; Schema: public; Owner: blamebot_admin
--

CREATE TABLE public.instances (
    "instanceId" character varying NOT NULL,
    "instanceName" character varying NOT NULL,
    "gitProvider" public."GitProviders" NOT NULL,
    "serviceBaseUrl" character varying NOT NULL
);


ALTER TABLE public.instances OWNER TO blamebot_admin;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: blamebot_admin
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO blamebot_admin;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: blamebot_admin
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO blamebot_admin;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: blamebot_admin
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: object_types; Type: TABLE; Schema: public; Owner: blamebot_admin
--

CREATE TABLE public.object_types (
    "objectType" public."GitObjectTypes" NOT NULL
);


ALTER TABLE public.object_types OWNER TO blamebot_admin;

--
-- Name: observable_objects; Type: TABLE; Schema: public; Owner: blamebot_admin
--

CREATE TABLE public.observable_objects (
    "objectId" character varying NOT NULL,
    "instanceId" character varying NOT NULL,
    "projectId" character varying NOT NULL,
    "objectType" public."GitObjectTypes" NOT NULL,
    pathname character varying NOT NULL
);


ALTER TABLE public.observable_objects OWNER TO blamebot_admin;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: blamebot_admin
--

CREATE TABLE public.projects (
    "projectId" character varying NOT NULL,
    "instanceId" character varying NOT NULL,
    name character varying NOT NULL,
    pathname character varying NOT NULL
);


ALTER TABLE public.projects OWNER TO blamebot_admin;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: blamebot_admin
--

CREATE TABLE public.subscriptions (
    "instanceUserId" character varying NOT NULL,
    "objectId" character varying NOT NULL,
    "instanceId" character varying NOT NULL,
    "projectId" character varying NOT NULL,
    "objectType" public."GitObjectTypes" NOT NULL,
    "isSubscribed" boolean NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO blamebot_admin;

--
-- Name: telegram_users; Type: TABLE; Schema: public; Owner: blamebot_admin
--

CREATE TABLE public.telegram_users (
    "telegramUserId" character varying NOT NULL,
    username character varying NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.telegram_users OWNER TO blamebot_admin;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: instance_users; Type: TABLE DATA; Schema: public; Owner: blamebot_admin
--

COPY public.instance_users ("instanceUserId", "instanceId", "telegramUserId", username, email, pathname) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: public; Owner: blamebot_admin
--

COPY public.instances ("instanceId", "instanceName", "gitProvider", "serviceBaseUrl") FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: blamebot_admin
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1744969724977	InitDatabase1744969724977
\.


--
-- Data for Name: object_types; Type: TABLE DATA; Schema: public; Owner: blamebot_admin
--

COPY public.object_types ("objectType") FROM stdin;
request
issue
\.


--
-- Data for Name: observable_objects; Type: TABLE DATA; Schema: public; Owner: blamebot_admin
--

COPY public.observable_objects ("objectId", "instanceId", "projectId", "objectType", pathname) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: blamebot_admin
--

COPY public.projects ("projectId", "instanceId", name, pathname) FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: blamebot_admin
--

COPY public.subscriptions ("instanceUserId", "objectId", "instanceId", "projectId", "objectType", "isSubscribed") FROM stdin;
\.


--
-- Data for Name: telegram_users; Type: TABLE DATA; Schema: public; Owner: blamebot_admin
--

COPY public.telegram_users ("telegramUserId", username, name) FROM stdin;
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: blamebot_admin
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, true);


--
-- Name: telegram_users PK_0c91694e3fef865a71cf808e7b9; Type: CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.telegram_users
    ADD CONSTRAINT "PK_0c91694e3fef865a71cf808e7b9" PRIMARY KEY ("telegramUserId");


--
-- Name: instances PK_4371bdb22fb067ac72906098496; Type: CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.instances
    ADD CONSTRAINT "PK_4371bdb22fb067ac72906098496" PRIMARY KEY ("instanceId");


--
-- Name: observable_objects PK_6660c3692e9c669b4e101f79cb7; Type: CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.observable_objects
    ADD CONSTRAINT "PK_6660c3692e9c669b4e101f79cb7" PRIMARY KEY ("objectId", "instanceId", "projectId", "objectType");


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: object_types PK_9039c1f53d943f1080d0055b4b0; Type: CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.object_types
    ADD CONSTRAINT "PK_9039c1f53d943f1080d0055b4b0" PRIMARY KEY ("objectType");


--
-- Name: projects PK_a240d9519344feb712d745cb388; Type: CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "PK_a240d9519344feb712d745cb388" PRIMARY KEY ("projectId", "instanceId");


--
-- Name: instance_users PK_a6eeb4a7322fe5fc743792d906e; Type: CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.instance_users
    ADD CONSTRAINT "PK_a6eeb4a7322fe5fc743792d906e" PRIMARY KEY ("instanceUserId", "instanceId");


--
-- Name: subscriptions PK_af4eb2db49cd904e74724c80043; Type: CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "PK_af4eb2db49cd904e74724c80043" PRIMARY KEY ("instanceUserId", "objectId", "instanceId", "projectId", "objectType");


--
-- Name: instances UQ_c2b3096d7dc1448062a871a0dc4; Type: CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.instances
    ADD CONSTRAINT "UQ_c2b3096d7dc1448062a871a0dc4" UNIQUE ("serviceBaseUrl");


--
-- Name: projects FK_135a45ff7462c17b96482c3da44; Type: FK CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "FK_135a45ff7462c17b96482c3da44" FOREIGN KEY ("instanceId") REFERENCES public.instances("instanceId");


--
-- Name: observable_objects FK_56966fac82df9562a1a244ece06; Type: FK CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.observable_objects
    ADD CONSTRAINT "FK_56966fac82df9562a1a244ece06" FOREIGN KEY ("objectType") REFERENCES public.object_types("objectType");


--
-- Name: instance_users FK_5f61f7b510028b31495d3cce5c5; Type: FK CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.instance_users
    ADD CONSTRAINT "FK_5f61f7b510028b31495d3cce5c5" FOREIGN KEY ("telegramUserId") REFERENCES public.telegram_users("telegramUserId");


--
-- Name: subscriptions FK_94304a1614c818d53db55ae9a72; Type: FK CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "FK_94304a1614c818d53db55ae9a72" FOREIGN KEY ("instanceUserId", "instanceId") REFERENCES public.instance_users("instanceUserId", "instanceId");


--
-- Name: observable_objects FK_b0556d711a022cbbe9c6fdbbbd6; Type: FK CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.observable_objects
    ADD CONSTRAINT "FK_b0556d711a022cbbe9c6fdbbbd6" FOREIGN KEY ("projectId", "instanceId") REFERENCES public.projects("projectId", "instanceId");


--
-- Name: instance_users FK_c29663fe3fdf0965b33f9734ef1; Type: FK CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.instance_users
    ADD CONSTRAINT "FK_c29663fe3fdf0965b33f9734ef1" FOREIGN KEY ("instanceId") REFERENCES public.instances("instanceId");


--
-- Name: subscriptions FK_c9573274c5dcdbfde949510c0f6; Type: FK CONSTRAINT; Schema: public; Owner: blamebot_admin
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "FK_c9573274c5dcdbfde949510c0f6" FOREIGN KEY ("objectId", "instanceId", "projectId", "objectType") REFERENCES public.observable_objects("objectId", "instanceId", "projectId", "objectType");


--
-- PostgreSQL database dump complete
--

