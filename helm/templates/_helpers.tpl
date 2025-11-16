{{/* ------------------------------------------------------------------
  Expand the name of the chart
------------------------------------------------------------------ */}}
{{- define "yahalom-gateway.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* ------------------------------------------------------------------
  Create a default fully qualified app name
------------------------------------------------------------------ */}}
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

{{/* ------------------------------------------------------------------
  Chart name and version for labels
------------------------------------------------------------------ */}}
{{- define "yahalom-gateway.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* ------------------------------------------------------------------
  Common labels
------------------------------------------------------------------ */}}
{{- define "yahalom-gateway.labels" -}}
helm.sh/chart: {{ include "yahalom-gateway.chart" . }}
{{ include "yahalom-gateway.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/* ------------------------------------------------------------------
  Selector labels
------------------------------------------------------------------ */}}
{{- define "yahalom-gateway.selectorLabels" -}}
app.kubernetes.io/name: {{ include "yahalom-gateway.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/* ------------------------------------------------------------------
  Returns the image tag
------------------------------------------------------------------ */}}
{{- define "yahalom-gateway.tag" -}}
{{- default (printf "v%s" .Chart.AppVersion) .Values.image.tag }}
{{- end -}}

{{/* ------------------------------------------------------------------
  Cloud provider helpers
------------------------------------------------------------------ */}}
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
{{- default "" .Values.cloudProvider.imagePullSecretName }}
{{- end -}}

{{/* ------------------------------------------------------------------
  Tracing and metrics URLs
------------------------------------------------------------------ */}}
{{- define "yahalom-gateway.tracingUrl" -}}
{{- default "" .Values.env.tracing.url }}
{{- end -}}

{{- define "yahalom-gateway.metricsUrl" -}}
{{- default "" .Values.env.metrics.url }}
{{- end -}}
