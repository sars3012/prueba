--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: sbcuenta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sbcuenta (
    nrocuenta character varying(10) NOT NULL,
    monto numeric(15,2) NOT NULL,
    usuario_id bigint NOT NULL,
    estado boolean DEFAULT true NOT NULL
);


ALTER TABLE public.sbcuenta OWNER TO postgres;

--
-- Name: sbrol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sbrol (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.sbrol OWNER TO postgres;

--
-- Name: sbrol_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sbrol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sbrol_id_seq OWNER TO postgres;

--
-- Name: sbrol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sbrol_id_seq OWNED BY public.sbrol.id;


--
-- Name: sbtransaccion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sbtransaccion (
    nrotransaccion integer NOT NULL,
    cuenta_id character varying(10) NOT NULL,
    monto numeric(15,2) NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tipo character varying(20) NOT NULL,
    cuentadestino_id character varying(10)
);


ALTER TABLE public.sbtransaccion OWNER TO postgres;

--
-- Name: sbtransaccion_nrotransaccion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sbtransaccion_nrotransaccion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sbtransaccion_nrotransaccion_seq OWNER TO postgres;

--
-- Name: sbtransaccion_nrotransaccion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sbtransaccion_nrotransaccion_seq OWNED BY public.sbtransaccion.nrotransaccion;


--
-- Name: sbusuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sbusuario (
    identificacion bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    correo character varying(100) NOT NULL,
    "contraseña" character varying(255) NOT NULL,
    rol_id integer NOT NULL,
    estado boolean DEFAULT true NOT NULL
);


ALTER TABLE public.sbusuario OWNER TO postgres;

--
-- Name: sbrol id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sbrol ALTER COLUMN id SET DEFAULT nextval('public.sbrol_id_seq'::regclass);


--
-- Name: sbtransaccion nrotransaccion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sbtransaccion ALTER COLUMN nrotransaccion SET DEFAULT nextval('public.sbtransaccion_nrotransaccion_seq'::regclass);


--
-- Data for Name: sbcuenta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sbcuenta (nrocuenta, monto, usuario_id, estado) FROM stdin;
4138642955	1000000.00	988988	t
6484438925	1000000.00	988977	t
6508687061	951000.00	987654	t
4015401780	1050000.00	124578	t
\.


--
-- Data for Name: sbrol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sbrol (id, nombre) FROM stdin;
1	Admin
2	Cliente
\.


--
-- Data for Name: sbtransaccion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sbtransaccion (nrotransaccion, cuenta_id, monto, fecha, tipo, cuentadestino_id) FROM stdin;
1	6508687061	500.00	2024-10-11 08:24:59.177967	deposito	\N
2	6508687061	500.00	2024-10-11 08:27:20.358002	deposito	\N
3	4138642955	50000.00	2024-10-11 08:54:21.495769	deposito	\N
4	4138642955	50000.00	2024-10-11 09:00:39.549528	deposito	\N
5	4138642955	50000.00	2024-10-11 09:02:36.546358	retiro	\N
6	4138642955	50000.00	2024-10-11 09:02:41.418567	retiro	\N
7	4138642955	50000.00	2024-10-11 09:03:43.931382	retiro	\N
8	4138642955	50000.00	2024-10-11 09:05:03.538747	retiro	\N
9	4138642955	50000.00	2024-10-11 09:08:15.972933	retiro	\N
10	4138642955	50000.00	2024-10-11 09:10:17.435993	retiro	\N
11	4138642955	50000.00	2024-10-11 09:13:09.962112	transferencia	6484438925
12	4138642955	50000.00	2024-10-11 16:04:37.734183	deposito	\N
13	4138642955	50000.00	2024-10-11 16:09:08.746107	deposito	\N
14	4138642955	50000.00	2024-10-11 16:10:32.55889	deposito	\N
15	4138642955	50000.00	2024-10-11 16:12:05.498021	deposito	\N
16	4138642955	50000.00	2024-10-11 16:13:26.830639	deposito	\N
17	6484438925	50000.00	2024-10-11 16:32:22.058442	retiro	\N
18	6508687061	50000.00	2024-10-11 16:41:30.146169	transferencia	4015401780
\.


--
-- Data for Name: sbusuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sbusuario (identificacion, nombre, correo, "contraseña", rol_id, estado) FROM stdin;
987654	Nuevo Usuario2	nuevo.usuario2@example.com	$2b$10$DEU2xy0R/q.M7iTgpHnHk.pwR4ouJu0oBpfaFxRnMUshmTB4g8DBK	2	t
1234569	Nuevo Nombre1	nuevo.correo@example.com	$2b$10$Ez.e0g0SKgF6rcYd1EHDFOkoSPQKx.76feIF4gitzMIRKXLejvqm6	1	t
988988	Nuevo Usuario3	nuevo.usuario3@example.com	$2b$10$mOcytmjS/EHE2.ZGEKQjQ.zuK5mtuvdm3TklQJHOsEZ883LMT4IPO	2	t
988977	Nuevo Usuario4	nuevo.usuario4@example.com	$2b$10$LcDEZa4GDgwwsiFihOi0ieXW7ScBF/Hp63cJOK5cm2mMeFEUIgQP2	2	t
124578	pepipo perez	pepito@gmail.com	$2b$10$OosdisdJWIFmiNh4hCC42eky3Sod4sizq7oWgmbObTXtsS3q3F/iC	2	f
2	María López	maria.lopez@example.com	$2a$06$xYDrgH83O9ifqIgPA71Xju3KlhzYANyT7JgeqoSJpOk0bQjUc9Fwe	2	f
1	Juan Pérez	juan.perez@example.com	$2a$06$pMfNznebfK.Y4mZWm5ZsJOyvPT5mk.x4JudE83aK7Tv6PDpC8Tmc.	1	t
\.


--
-- Name: sbrol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sbrol_id_seq', 2, true);


--
-- Name: sbtransaccion_nrotransaccion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sbtransaccion_nrotransaccion_seq', 18, true);


--
-- Name: sbcuenta sbcuenta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sbcuenta
    ADD CONSTRAINT sbcuenta_pkey PRIMARY KEY (nrocuenta);


--
-- Name: sbrol sbrol_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sbrol
    ADD CONSTRAINT sbrol_nombre_key UNIQUE (nombre);


--
-- Name: sbrol sbrol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sbrol
    ADD CONSTRAINT sbrol_pkey PRIMARY KEY (id);


--
-- Name: sbtransaccion sbtransaccion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sbtransaccion
    ADD CONSTRAINT sbtransaccion_pkey PRIMARY KEY (nrotransaccion);


--
-- Name: sbusuario sbusuario_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sbusuario
    ADD CONSTRAINT sbusuario_correo_key UNIQUE (correo);


--
-- Name: sbusuario sbusuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sbusuario
    ADD CONSTRAINT sbusuario_pkey PRIMARY KEY (identificacion);


--
-- Name: idx_transaccion_cuenta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transaccion_cuenta ON public.sbtransaccion USING btree (cuenta_id);


--
-- Name: sbcuenta sbcuenta_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sbcuenta
    ADD CONSTRAINT sbcuenta_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.sbusuario(identificacion) ON DELETE CASCADE;


--
-- Name: sbtransaccion sbtransaccion_cuenta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sbtransaccion
    ADD CONSTRAINT sbtransaccion_cuenta_id_fkey FOREIGN KEY (cuenta_id) REFERENCES public.sbcuenta(nrocuenta) ON DELETE CASCADE;


--
-- Name: sbusuario sbusuario_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sbusuario
    ADD CONSTRAINT sbusuario_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.sbrol(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

