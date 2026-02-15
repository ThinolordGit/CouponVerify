<?php
/**
 * Validator.php - Input Validation Rules & Methods
 * Provides centralized validation for API inputs
 */

namespace App\Utils;

class Validator {

    private $errors = [];

    /**
     * Validate email format
     */
    public static function email($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validate numeric value
     */
    public static function numeric($value) {
        return is_numeric($value);
    }

    /**
     * Validate integer
     */
    public static function integer($value) {
        return filter_var($value, FILTER_VALIDATE_INT) !== false;
    }

    /**
     * Validate string length
     */
    public static function length($value, $min, $max = null) {
        $len = strlen($value);
        if ($len < $min) return false;
        if ($max && $len > $max) return false;
        return true;
    }

    /**
     * Validate in array
     */
    public static function inArray($value, $array) {
        return in_array($value, $array, true);
    }

    /**
     * Validate date format
     */
    public static function dateFormat($date, $format = 'Y-m-d') {
        $d = \DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }

    /**
     * Validate URL
     */
    public static function url($url) {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    /**
     * Validate currency code (ISO 4217)
     */
    public static function currency($code) {
        $valid = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'NZD'];
        return in_array(strtoupper($code), $valid);
    }

    /**
     * Validate verification status
     */
    public static function verificationStatus($status) {
        $valid = ['valid', 'invalid', 'pending', 'blocked'];
        return in_array($status, $valid);
    }

    /**
     * Batch validation
     */
    public function validate($data, $rules) {
        $this->errors = [];

        foreach ($rules as $field => $ruleSet) {
            $value = $data[$field] ?? null;
            $ruleParts = explode('|', $ruleSet);

            foreach ($ruleParts as $rule) {
                $rule = trim($rule);

                if ($rule === 'required' && (empty($value) && $value !== '0')) {
                    $this->errors[$field] = "$field is required";
                    break;
                } elseif (strpos($rule, 'min:') === 0) {
                    $min = (int)substr($rule, 4);
                    if (strlen((string)$value) < $min) {
                        $this->errors[$field] = "$field must be at least $min characters";
                    }
                } elseif (strpos($rule, 'max:') === 0) {
                    $max = (int)substr($rule, 4);
                    if (strlen((string)$value) > $max) {
                        $this->errors[$field] = "$field must not exceed $max characters";
                    }
                } elseif ($rule === 'email' && $value && !self::email($value)) {
                    $this->errors[$field] = "$field must be a valid email";
                } elseif ($rule === 'numeric' && $value && !self::numeric($value)) {
                    $this->errors[$field] = "$field must be numeric";
                } elseif ($rule === 'integer' && $value && !self::integer($value)) {
                    $this->errors[$field] = "$field must be an integer";
                }
            }
        }

        return empty($this->errors);
    }

    /**
     * Get validation errors
     */
    public function getErrors() {
        return $this->errors;
    }

    /**
     * Check if has errors
     */
    public function hasErrors() {
        return !empty($this->errors);
    }
}
