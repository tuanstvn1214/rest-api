create database employee_management;

\ c employee_management;

create table employee(
  id serial PRIMARY KEY,
  code varchar(20) UNIQUE,
  name text,
  phone varchar(20),
  email text,
  sex smallint,
  avatar text
);

create table department(
  id serial PRIMARY KEY,
  code varchar(20) UNIQUE,
  name text
);

create table department_employee(
  id serial PRIMARY KEY,
  employee_id integer,
  department_id integer,
  FOREIGN KEY (employee_id) REFERENCES employee(id),
  FOREIGN KEY (department_id) REFERENCES department(id)
);

create index idx_department_employee_employee_id on department_employee (employee_id);

create index idx_department_employee_department_id on department_employee (department_id);

-- create index idx_employee_code on employee (code);
-- create index idx_department_code on department (code);
CREATE
OR REPLACE FUNCTION generate_employee_code() RETURNS TRIGGER AS $ $ DECLARE last_code text;

new_code text;

BEGIN IF NEW.code IS NULL
OR NEW.code = '' THEN -- Kiểm tra xem có bản ghi employee trước đó không
SELECT
  code INTO last_code
FROM
  employee
ORDER BY
  id DESC
LIMIT
  1;

IF last_code IS NOT NULL THEN -- Phân tích cấu trúc của mã code trước đó
SELECT
  regexp_matches(last_code, '^(\d+)-?(.*)$') INTO new_code;

IF new_code IS NOT NULL THEN new_code := lpad(
  CAST(
    SUBSTRING(
      new_code
      FROM
        '^\d+'
    ) AS integer
  ) + 1,
  length(new_code),
  '0'
) || '-' || SUBSTRING(
  new_code
  FROM
    '\d+-(.*)$'
);

END IF;

ELSE new_code := '00001-Emp';

END IF;

NEW.code := new_code;

END IF;

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_employee_code BEFORE
INSERT
  ON employee FOR EACH ROW EXECUTE FUNCTION generate_employee_code();
