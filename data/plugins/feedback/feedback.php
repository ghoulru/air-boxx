<?php
if (!defined('FEEDBACK_DIR'))
    define("FEEDBACK_DIR", "plugins/feedback");
if (!defined('FEEDBACK_EMAIL_OPTION_NAME'))
    define("FEEDBACK_EMAIL_OPTION_NAME", "feedback_email");

switch ($modx->event->name) {
    case "OnMODXInit":

        $Setting = $modx->getObject('modSystemSetting', FEEDBACK_EMAIL_OPTION_NAME);

        //var_dump('XXX');
        //var_dump($Setting);

        if (1 || $Setting == null) {
            $setting = $modx->newObject('modSystemSetting');
            $setting->set('key', FEEDBACK_EMAIL_OPTION_NAME);
            $setting->set('value', 'noreply@' . $_SERVER['HTTP_HOST']);
            $setting->set('xtype', 'textfield');
            $setting->set('namespace', 'feedback');
            $setting->set('area', 'feedback');
            $setting->save();

            $setting->updateTranslation(
                'setting_' . FEEDBACK_EMAIL_OPTION_NAME,
                'E-mail для получения писем (Если пусто, используется emailsender)',
                [
                    'namespace' => 'feedback',
                    'language'  => 'ru',
                    'topic'     => 'settings'
                ]
            );
        }
        $modx->regClientScript(MODX_ASSETS_URL . FEEDBACK_DIR . '/feedback.js');
        $modx->regClientCSS(MODX_ASSETS_URL . FEEDBACK_DIR . '/feedback.css');

        break;

    case "OnWebPagePrerender":

        break;
}
if (!class_exists('Feedback')) {
    class Feedback {

        private $modx;

        public $error = array();

        function __construct($modx) {
            $this->modx = $modx;
        }
        public function getForm($id) {
            $title = 'Ошибка';

            $res = $this->modx->getObject('modResource', intval($id));

            if ($res !== null) {
                $longtitle = $res->get('longtitle');
                $pagetitle = $res->get('pagetitle');

                $title = $longtitle != '' ? $longtitle : $pagetitle;
                $form = $res->get('content');

                $form = str_replace("[[+id]]", $res->get('id'), $form);
            }
            else
                $form = 'Не найден ресурс с ID=' . $id;


            return [$title, $form];
        }

        public function send($id, $data) {

            $result = array(
                'title' => '',
                'html'  => '',
                'error' => array()
            );

            $res = $this->modx->getObject('modResource', intval($id));
            if ($res == null) {
                $result['error'][] = 'Не найден раздел с телом письма с ID=' . $id;
                return $result;
            }
            $emailsender = $this->modx->getOption('emailsender', null);

            $email = $this->modx->getOption(
                FEEDBACK_EMAIL_OPTION_NAME,
                null,
                ''
            );

            if ($email == '')
                $email = $emailsender;


            //$email = 'proporcia@ya.ru';

            $replyTo = isset($data['email']) ? trim($data['email']) : '';


            $longtitle = $res->get('longtitle');
            $pagetitle = $res->get('pagetitle');

            $subject = $longtitle != '' ? $longtitle : $pagetitle;
            $letter = $res->get('content');

            if (!isset($data['recommend']))
                $data['recommend'] = 'не выбрано';

            if (isset($_SESSION['feedbackFile']))
                $data['fileUrl'] = ltrim($_SESSION['feedbackFile'], '/');

            $chunk = $this->modx->newObject('modChunk', array('name' => "{tmp}-{".uniqid()."}"));
            $chunk->setCacheable(false);
            $letter = $chunk->process($data, $letter);

            /*foreach($data as $key => $val) {
                $letter = str_ireplace("[[+" . $key . "]]", $val, $letter);
            }*/

            if (isset($data['returnEmail'])) {
                $result['html'] = $letter;
                return $result;
            }

            /**/
            $this->modx->getService('mail', 'mail.modPHPMailer');
            $this->modx->mail->set(modMail::MAIL_BODY, $letter);
            $this->modx->mail->set(modMail::MAIL_FROM, $emailsender);
            //$this->modx->mail->set(modMail::MAIL_FROM_NAME,'Johnny Tester');
            $this->modx->mail->set(modMail::MAIL_SUBJECT, $subject);
            $this->modx->mail->address('to', $email);
            if ($replyTo != '')
                $this->modx->mail->address('reply-to', $replyTo);
            $this->modx->mail->setHTML(true);

            if (!$this->modx->mail->send()) {
                $result['error'][] = $email . ': Невозможно отправить письмо: ' . $this->modx->mail->mailer->ErrorInfo;
                //$modx->log(modX::LOG_LEVEL_ERROR,'An error occurred while trying to send the email: '.$modx->mail->mailer->ErrorInfo);
            }
            else {
                $result['title'] = '';


                if ($data['formId'] == 'reviews')
                    $result['html'] = self::reviewOk();
                else
                    $result['html'] = self::sendOk('Ваша заявка отправлена');
            }
            $this->modx->mail->reset();
            /**/

            return $result;
        }
        public static function sendOk($title) {
            return '<div class="dw-ok _tac">
                <img src="/data/img/ok.png" />
                <h2>' . $title . '</h2>
                <div class="js-dialog-close btn -g">
                    OK
                </div>
            </div>';
        }
        public static function reviewOk() {
            return '<div class="dw-ok _tac">
                <img src="/data/img/review-ok.png" />
                <h2>Спасибо</h2>
                <div class="reviews-ok-txt">
                    <p>Ваш отзыв отправлен</p>
                    <p>После проверки администратором,<br> он будет опубликован на сайте</p>
                </div>
            </div>';
        }
    }


}