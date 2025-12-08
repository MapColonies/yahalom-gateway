{{- define "yahalom-gateway.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{- define "yahalom-gateway.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "yahalom-gateway.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{- define "yahalom-gateway.labels" -}}
helm.sh/chart: {{ include "yahalom-gateway.chart" . }}
{{ include "yahalom-gateway.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{ include "mclabels.labels" . }}
{{- end -}}

{{- define "yahalom-gateway.selectorLabels" -}}
app.kubernetes.io/name: {{ include "yahalom-gateway.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{ include "mclabels.selectorLabels" . }}
{{- end -}}

{{- define "yahalom-gateway.tag" -}}
{{- default (printf "v%s" .Chart.AppVersion) .Values.image.tag }}
{{- end -}}

{{- define "yahalom-gateway.cloudProviderFlavor" -}}
{{- default "minikube" .Values.cloudProvider.flavor }}
{{- end -}}

{{- define "yahalom-gateway.cloudProviderDockerRegistryUrl" -}}
{{- if .Values.cloudProvider.dockerRegistryUrl }}
{{- $url := .Values.cloudProvider.dockerRegistryUrl -}}
{{- if not (hasSuffix $url "/") -}}
{{- printf "%s/" $url -}}
{{- else -}}
{{- $url -}}
{{- end -}}
{{- else -}}
{{- "" -}}
{{- end -}}
{{- end -}}

{{- define "yahalom-gateway.cloudProviderImagePullSecretName" -}}
{{- if .Values.global.cloudProvider.imagePullSecretName }}
    {{- .Values.global.cloudProvider.imagePullSecretName -}}
{{- else if .Values.cloudProvider.imagePullSecretName -}}
    {{- .Values.cloudProvider.imagePullSecretName -}}
{{- end -}}
{{- end -}}

{{- define "yahalom-gateway.tracingUrl" -}}
{{- default "" .Values.env.tracing.url }}
{{- end -}}

{{- define "yahalom-gateway.metricsUrl" -}}
{{- default "" .Values.env.metrics.url }}
{{- end -}}
